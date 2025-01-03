moment_types = {
    "introduction": {
        "primary_keywords": ["name", "i am", "i'm", "introduce", "myself", "meet", "called", "known as", "identity"],
        "secondary_keywords": ["hello", "hi", "hey", "greetings", "pleasure", "nice to meet", "how are you", "what's up"],
        "patterns": [
            r'(?i)((my name|i am|i\'m|this is|allow me to introduce|known as|called).*)',
            r'(?i)(hello|hi|hey|greetings|what\'s up).*',
            r'(?i).*(pleasure to (meet|introduce)|nice to meet you).*'
        ]
    },
    "emotional": {
        "primary_keywords": ["love", "hate", "excited", "passionate", "favorite", "amazing", "wonderful", "frustrated", "angry", "thrilled", "happy", "sad", "depressed", "overjoyed", "enthusiastic"],
        "secondary_keywords": ["like", "enjoy", "great", "good", "best", "interesting", "disappointed", "appreciate", "grateful", "thankful", "uplifting", "heartwarming"],
        "patterns": [
            r'(?i).*(love|hate|enjoy|like|thrilled|frustrated|happy|sad|depressed|overjoyed).*',
            r'(?i).*favorite.*',
            r'(?i).*(excited|passionate|grateful) about.*',
            r'(?i).*(angry|disappointed).*'
        ]
    },
    "expertise": {
        "primary_keywords": ["experience", "worked", "years", "specialist", "expert", "background", "knowledge", "qualified", "skilled"],
        "secondary_keywords": ["skills", "trained", "studied", "proficient", "professional", "certified", "expertise", "veteran"],
        "patterns": [
            r'(?i).*\b\d+\s*(year|yr)s?\b.*',
            r'(?i).*(worked|working|experience|background|knowledge).*',
            r'(?i).*(certified|proficient|specialist|skilled|qualified).*'
        ]
    },
    "engagement": {
        "primary_keywords": ["help", "question", "ask", "support", "need", "advice", "assistance"],
        "secondary_keywords": ["looking for", "interested", "want", "seeking", "curious", "inquire", "clarification", "guide"],
        "patterns": [
            r'\?$', 
            r'(?i)^(can|could|would|will|how|what|when|where|why|who|is|are|do|does).*',
            r'(?i).*need (help|support|advice|assistance|clarification).*'
        ]
    },
    "storytelling": {
        "primary_keywords": ["story", "moment", "time", "experience", "remember", "recollection"],
        "secondary_keywords": ["once", "share", "example", "instance", "event", "recalled", "narrate", "tale"],
        "patterns": [
            r'(?i).*(let me tell|once upon a time|there was a time).*',
            r'(?i).*(story|example|moment|time|recollection).*',
            r'(?i).*remember when.*'
        ]
    },
    "call_to_action": {
        "primary_keywords": ["visit", "check out", "contact", "join", "sign up", "subscribe", "follow", "explore"],
        "secondary_keywords": ["try", "discover", "learn more", "engage", "participate", "connect"],
        "patterns": [
            r'(?i).*(visit|check out|contact|join|sign up|subscribe|follow|try).*',
            r'(?i).*learn more.*'
        ]
    },
    "achievement": {
        "primary_keywords": ["achieved", "accomplished", "completed", "success", "won", "mastered"],
        "secondary_keywords": ["proud", "goal", "finished", "reached", "milestone", "victory"],
        "patterns": [
            r'(?i).*(achieved|accomplished|completed|won|success).*',
            r'(?i).*proud of.*',
            r'(?i).*reached (a|the) (milestone|goal|peak).*'
        ]
    },
    "gratitude": {
        "primary_keywords": ["thank you", "grateful", "appreciate", "thanks", "blessed", "thankfulness"],
        "secondary_keywords": ["thankful", "gratitude", "kindness", "support", "recognition"],
        "patterns": [
            r'(?i).*(thank you|thanks|grateful|appreciate|recognize).*',
            r'(?i).*feel (blessed|thankful).*',
            r'(?i).*gratitude.*'
        ]
    },
    "humor": {
        "primary_keywords": ["joke", "funny", "hilarious", "laugh", "comedy", "sarcastic"],
        "secondary_keywords": ["humor", "giggle", "amused", "smile", "witty"],
        "patterns": [
            r'(?i).*(joke|funny|laugh|hilarious|sarcastic).*',
            r'(?i).*made me (laugh|smile).*',
            r'(?i).*that was (so|really) funny.*'
        ]
    },
    "confusion": {
        "primary_keywords": ["confused", "lost", "unclear", "don't understand", "unsure", "puzzled"],
        "secondary_keywords": ["questioning", "need clarity", "doubt", "stuck", "uncertainty"],
        "patterns": [
            r'(?i).*(confused|unclear|don\'t understand|unsure|puzzled).*',
            r'(?i).*need (clarity|help|direction).*',
            r'(?i).*stuck on.*'
        ]
    },
    "inspirational": {
        "primary_keywords": ["inspire", "motivate", "aspire", "encourage", "dream"],
        "secondary_keywords": ["hope", "goal", "vision", "ambition", "uplifting", "positivity"],
        "patterns": [
            r'(?i).*(inspire|motivate|encourage|uplift).*',
            r'(?i).*dream (big|about).*',
            r'(?i).*goal to.*'
        ]
    },
    "thematic": {
        "primary_keywords": ["theme", "topic", "concept", "idea", "genre"],
        "secondary_keywords": ["related", "context", "perspective", "overview", "framework"],
        "patterns": [
            r'(?i).*(theme|topic|concept|idea|genre).*',
            r'(?i).*related to.*',
            r'(?i).*context of.*'
        ]
    },
    "closing": {
        "primary_keywords": ["farewell", "summarization"],
        "secondary_keywords": ["thank", "goodbye", "see you", "appreciate", "summary", "wrap up", "take care"],
        "patterns": [
            r'(?i).*\b(thank\s+you|thanks)\b.*',
            r'(?i).*\b(goodbye|see\s+you)\b.*',
            r'(?i).*\b\summary\b.*',
            r'(?i).*\b\take\s+care\b.*'
        ]
    },
    "action": {
        "primary_keywords": ["do", "perform", "execute", "act", "complete", "start", "begin", "proceed", "implement"],
        "secondary_keywords": ["task", "activity", "assignment", "duty", "responsibility", "plan", "follow"],
        "patterns": [
            r'(?i).*(start|begin|proceed|perform|execute|do).*',
            r'(?i).*please (do|complete|execute|follow).*',
            r'(?i).*(act|implement|carry out|get it done).*'
        ]
    },
    "transition": {
        "primary_keywords": ["move", "shift", "transition", "change", "progress", "segue", "pivot", "switch", "turn"],
        "secondary_keywords": ["next", "following", "continue", "proceed", "advance", "shift to", "switch to"],
        "patterns": [
            r'(?i).*(let us|let\'s) (move|shift|transition|proceed).*',
            r'(?i).*now (we|let us|let\'s) (turn|switch|progress|segue).*',
            r'(?i).*(next up|coming up|moving on).*'
        ]
    },
    "acknowledgement": {
        "primary_keywords": ["recognize", "acknowledge", "accept", "agree", "thank", "understand", "note", "confirm"],
        "secondary_keywords": ["appreciate", "grateful", "recognition", "approval", "realize", "aware", "admit"],
        "patterns": [
            r'(?i).*(thank you|thanks|acknowledge|recognize|appreciate).*',
            r'(?i).*we (agree|understand|note|accept).*',
            r'(?i).*it\'s (noted|understood|appreciated).*'
        ]
    }

}


# def get_proto_moment_type(typeNumbers: list[int]):
#     print("moment type number", typeNumbers)
#     if not len(typeNumbers):
#         return [
#             "emotional",
#             "inspirational",
#             "thematic",
#             "action",
#             "transition",
#             "introduction",
#             "closing",
#             "expertise",
#             "engagement",
#             "storytelling",
#             "call_to_action",
#             "gratitude",
#             "humor",
#             "confusion"
#         ]
    
#     moments = []
    
#     for num in typeNumbers:
#         if num == 1:
#             moments.append("emotional")
#         elif num == 2:
#             moments.append("inspirational")
#         elif num == 3:
#             moments.append("thematic")
#         elif num == 4:
#             moments.append("action")
#         elif num == 5:
#             moments.append("transition")
#         elif num == 6:
#             moments.append("introduction")
#         elif num == 7:
#             moments.append("closing")
#         elif num == 8:
#             moments.append("expertise")
#         elif num == 9:
#             moments.append("engagement")
#         elif num == 10:
#             moments.append("storytelling")
#         elif num == 11:
#             moments.append("call_to_action")
#         elif num == 12:
#             moments.append("gratitude")
#         elif num == 13:
#             moments.append("humor")
#         elif num == 14:
#             moments.append("confusion")
        
#     return moments



def get_proto_moment_type(types: list[int]):
    moment_keys = list(moment_types.keys())

    if not len(types) or "all" in types:
        return moment_keys
    
    return types
    # keys = []
    # for type in types:
    #     if type in moment_keys:
    #         keys.append(type)
    
    # if not len(keys):
    #     return moment_keys
    
    # return keys
    
    
    
