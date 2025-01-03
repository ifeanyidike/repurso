from transformers import pipeline
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
import re
from services import moment_type_utils
from services import upload_utils
from protobuf import media_analysis_pb2

@dataclass
class DetectedMoment:
    start: float
    end: float
    type: str
    confidence: float
    text: str
    validation_score: float

class MomentProcessor:
    def __init__(self, bucket):
        self.primary_classifier = pipeline("zero-shot-classification", 
                                        model="facebook/bart-large-mnli")
        self.moment_types = moment_type_utils.moment_types
        self.upload_utils = upload_utils.UploadUtils(bucket_name=bucket)


    def validate_pattern_match(self, text: str, moment_type: str) -> float:
        """
        Improved validation scoring with weighted components and partial matching.
        """
        if moment_type not in self.moment_types:
            return 0.0
        
        text_lower = text.lower()
        rules = self.moment_types[moment_type]
        score = 0.0
        
        # Pattern matching (40% of score)
        pattern_matches = any(re.search(pattern, text) for pattern in rules["patterns"])
        if pattern_matches:
            score += 0.4
        
        # Primary keyword matching (40% of score)
        primary_keyword_matches = sum(1 for keyword in rules["primary_keywords"] 
                                    if keyword.lower() in text_lower)
        if primary_keyword_matches > 0:
            score += min(0.4, 0.4 * (primary_keyword_matches / len(rules["primary_keywords"])))
        
        # Secondary keyword matching (20% of score)
        secondary_keyword_matches = sum(1 for keyword in rules["secondary_keywords"] 
                                      if keyword.lower() in text_lower)
        if secondary_keyword_matches > 0:
            score += min(0.2, 0.2 * (secondary_keyword_matches / len(rules["secondary_keywords"])))
        
        return score

    def detect_moment(self, moment_type: str, text: str, start: float, end: float) -> media_analysis_pb2.KeyMoment:
        """Detect and validate a moment using zero-shot classification and pattern matching."""
        # Get initial classification
        result = self.primary_classifier(
            text,
            candidate_labels=[moment_type],
            
            hypothesis_template="This is an example of {}."
        )
        print("result",result)
        
        moment_type = result['labels'][0]
        confidence = result['scores'][0]
        print("confidence", confidence, moment_type)
        
        # Get validation score
        validation_score = self.validate_pattern_match(text, moment_type)
        print("validation_score", validation_score)
        
        # Calculate final confidence as weighted average
        final_confidence = (confidence * 0.6) + (validation_score * 0.4) if moment_type in self.moment_types else confidence
        print("final_confidence",final_confidence)
        
        return media_analysis_pb2.KeyMoment(
            start=start,
            end=end,
            type=moment_type,
            confidence=final_confidence,
            text=text,
            validation_score=validation_score
        )

    def aggregate_moments(self, moments: List[media_analysis_pb2.KeyMoment], max_gap: float = 2.0) -> List[media_analysis_pb2.KeyMoment]:
        """Aggregate close moments with weighted confidence calculation."""
        if not moments:
            return []
        
        sorted_moments = sorted(moments, key=lambda x: x.start)
        aggregated = []
        current_moment = sorted_moments[0]
        
        for next_moment in sorted_moments[1:]:
            if (next_moment.start - current_moment.end <= max_gap and 
                next_moment.moment_type == current_moment.moment_type):
                
                total_duration = next_moment.end - current_moment.start
                weight1 = (current_moment.end - current_moment.start) / total_duration
                weight2 = (next_moment.end - next_moment.start) / total_duration
                
                combined_confidence = (
                    current_moment.confidence * weight1 + 
                    next_moment.confidence * weight2
                )
                
                combined_validation = (
                    current_moment.validation_score * weight1 + 
                    next_moment.validation_score * weight2
                )
                current_moment = media_analysis_pb2.KeyMoment(
                    start=current_moment.start,
                    end=next_moment.end,
                    type=current_moment.moment_type,
                    confidence=combined_confidence,
                    text=f"{current_moment.text} {next_moment.text}",
                    validation_score=combined_validation
                )
                # current_moment = DetectedMoment(
                #     start=current_moment.start,
                #     end=next_moment.end,
                #     type=current_moment.moment_type,
                #     confidence=combined_confidence,
                #     text=f"{current_moment.text} {next_moment.text}",
                #     validation_score=combined_validation
                # )
            else:
                aggregated.append(current_moment)
                current_moment = next_moment
        
        aggregated.append(current_moment)
        return aggregated
    
    def detect_segment_moment(self, 
                              moment_type: str, 
                              transcript: Dict[str, Any],
                              confidence_threshold: float = 0.6,
                              validation_threshold: float = 0.3):
        """Detect and validate moments within a segment."""
        detected_moments = []
        for segment in transcript['segments']:
            moment = self.detect_moment(moment_type, segment['text'], segment['start'], segment['end'])
            
            if moment.confidence >= confidence_threshold:
                if not moment_type in self.moment_types or moment.validation_score >= validation_threshold:
                    detected_moments.append(moment)
            # if (moment.confidence >= confidence_threshold and 
            #     moment.validation_score >= validation_threshold):
            #     detected_moments.append(moment)
        
        return self.aggregate_moments(detected_moments)

    def analyze_moment(self, 
                         transcript_url: str,
                         moment_type: str,
                         confidence_threshold: float = 0.6,
                         validation_threshold: float = 0.3) -> List[media_analysis_pb2.KeyMoment]:
        """Analyze transcript with improved validation."""

        transcript: Dict[str, Any] = self.upload_utils.fetch_object_from_s3(transcript_url)
        return self.detect_segment_moment(moment_type, transcript, confidence_threshold, validation_threshold)
    
    def analyze_moments(self, 
                         transcript_url: str,
                         moment_types: list[str],
                         confidence_threshold: float = 0.6,
                         validation_threshold: float = 0.3) -> List[media_analysis_pb2.KeyMoment]:
        """Analyze transcript with improved validation."""

        transcript: Dict[str, Any] = self.upload_utils.fetch_object_from_s3(transcript_url)
        print("moment_types", moment_types)
        aggregated_moments = []
        for type in moment_types:
            aggregated_moments += self.detect_segment_moment(type, transcript, confidence_threshold, validation_threshold)
        
        return aggregated_moments

