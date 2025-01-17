import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Wand2,
  Sparkles,
  Music,
  VideoIcon,
  Scissors,
  MessageSquare,
  Palette,
  Volume2,
  Clock,
  Zap,
  Eye,
  Brain,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const aiEffects = {
  enhancement: [
    {
      id: "smart-cuts",
      name: "Smart Cuts",
      description:
        "AI-powered editing to remove dead space and highlight key moments",
      icon: Scissors,
      intensity: 50,
      customPrompt: "",
    },
    {
      id: "audio-enhance",
      name: "Audio Enhancement",
      description: "Remove background noise and enhance voice clarity",
      icon: Volume2,
      intensity: 70,
      customPrompt: "",
    },
    {
      id: "color-grade",
      name: "Smart Color Grading",
      description: "AI-powered color correction and style transfer",
      icon: Palette,
      intensity: 60,
      customPrompt: "",
    },
  ],
  generation: [
    {
      id: "b-roll",
      name: "Auto B-Roll",
      description: "Generate relevant b-roll footage based on content",
      icon: VideoIcon,
      intensity: 50,
      customPrompt: "",
    },
    {
      id: "soundtrack",
      name: "AI Soundtrack",
      description: "Generate matching background music",
      icon: Music,
      intensity: 40,
      customPrompt: "",
    },
    {
      id: "captions",
      name: "Smart Captions",
      description: "Generate and style captions with emotional context",
      icon: MessageSquare,
      intensity: 80,
      customPrompt: "",
    },
  ],
  analysis: [
    {
      id: "key-moments",
      name: "Key Moments",
      description: "Automatically detect and highlight important segments",
      icon: Clock,
      intensity: 70,
      customPrompt: "",
    },
    {
      id: "engagement-optimizer",
      name: "Engagement Optimizer",
      description: "Analyze and optimize for viewer retention",
      icon: Zap,
      intensity: 60,
      customPrompt: "",
    },
    {
      id: "thumbnail-generator",
      name: "Thumbnail Generator",
      description: "Create eye-catching thumbnails from key frames",
      icon: Eye,
      intensity: 50,
      customPrompt: "",
    },
  ],
};

const AIEffectsPanel = ({ onApplyEffects }: any) => {
  const [selectedEffects, setSelectedEffects] = useState(new Set());
  const [activeEffect, setActiveEffect] = useState<any>(null);

  const toggleEffect = (effectId: any) => {
    const newSelected = new Set(selectedEffects);
    if (newSelected.has(effectId)) {
      newSelected.delete(effectId);
    } else {
      newSelected.add(effectId);
    }
    setSelectedEffects(newSelected);
  };

  const EffectCard = ({ effect, category }: any) => (
    <Card
      className={`cursor-pointer transition-all ${
        selectedEffects.has(effect.id)
          ? "ring-2 ring-blue-500 bg-blue-50"
          : "hover:shadow-md"
      }`}
      onClick={() => {
        toggleEffect(effect.id);
        setActiveEffect(effect);
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-lg ${
              selectedEffects.has(effect.id) ? "bg-blue-100" : "bg-gray-100"
            }`}
          >
            <effect.icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{effect.name}</h3>
              {selectedEffects.has(effect.id) && (
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-700"
                >
                  Active
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">{effect.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">AI Effects</h2>
          <Button variant="outline" size="sm">
            <Brain className="h-4 w-4 mr-2" />
            Save Preset
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-2/3 border-r">
          <Tabs defaultValue="enhancement" className="h-full flex flex-col">
            <div className="px-4 pt-2 border-b">
              <TabsList className="w-full">
                <TabsTrigger value="enhancement" className="flex-1">
                  Enhancement
                </TabsTrigger>
                <TabsTrigger value="generation" className="flex-1">
                  Generation
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex-1">
                  Analysis
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="enhancement" className="m-0">
                <div className="space-y-3">
                  {aiEffects.enhancement.map((effect) => (
                    <EffectCard
                      key={effect.id}
                      effect={effect}
                      category="enhancement"
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="generation" className="m-0">
                <div className="space-y-3">
                  {aiEffects.generation.map((effect) => (
                    <EffectCard
                      key={effect.id}
                      effect={effect}
                      category="generation"
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="analysis" className="m-0">
                <div className="space-y-3">
                  {aiEffects.analysis.map((effect) => (
                    <EffectCard
                      key={effect.id}
                      effect={effect}
                      category="analysis"
                    />
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="w-1/3 p-4">
          {activeEffect ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">Effect Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Intensity
                    </label>
                    <Slider
                      defaultValue={[activeEffect.intensity]}
                      max={100}
                      step={1}
                      className="mb-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">
                      Custom Prompt
                    </label>
                    <Input
                      placeholder="Customize AI behavior..."
                      className="mb-2"
                    />
                    <p className="text-xs text-gray-500">
                      Guide the AI with specific instructions or preferences
                    </p>
                  </div>
                </div>
              </div>

              <Card className="p-4 bg-blue-50/50 border-blue-100">
                <h4 className="font-medium mb-3">Processing Impact</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Time</span>
                    <span className="font-medium">~2 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Impact</span>
                    <span className="text-green-600">High</span>
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <Wand2 className="h-8 w-8 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">
                  Select an effect to customize settings
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {selectedEffects.size} effects selected
            </p>
            <p className="text-sm text-gray-600">
              Estimated processing time: ~5 minutes
            </p>
          </div>
          <Button
            onClick={() => onApplyEffects(selectedEffects)}
            disabled={selectedEffects.size === 0}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Apply Effects
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIEffectsPanel;
