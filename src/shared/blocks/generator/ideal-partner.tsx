'use client';

import { useEffect, useMemo, useState } from 'react';
import { AstroWheel } from '@/components/astrokline/charts/astro-wheel';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import { CreditCard, Loader2, Sparkles, User, Download, ImageIcon, Lock, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import { Input } from '@/shared/components/ui/input';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';
import { LazyImage } from '@/shared/blocks/common';

interface IdealPartnerGeneratorProps {
  srOnlyTitle?: string;
  className?: string;
}

interface GeneratedImage {
  id: string;
  url: string;
}

interface BackendTask {
  id: string;
  status: string;
  taskInfo: string | null;
  taskResult: string | null;
}

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;
const MAX_PROMPT_LENGTH = 500;

export function IdealPartnerGenerator({
  srOnlyTitle,
  className,
}: IdealPartnerGeneratorProps) {
  const t = useTranslations('ai.ideal-partner.generator');

  const [costCredits] = useState<number>(4);
  const [birthdate, setBirthdate] = useState('');
  const [preference, setPreference] = useState('');
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [step, setStep] = useState(0);
  
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } = useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const promptLength = additionalPrompt.trim().length;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;

  // Poll Task Status Helpers
  const resetTaskState = () => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  };

  const pollTaskStatus = async (id: string) => {
    try {
      if (generationStartTime && Date.now() - generationStartTime > GENERATION_TIMEOUT) {
        resetTaskState();
        toast.error('Image generation timed out. Please try again.');
        return true;
      }

      const resp = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id }),
      });

      if (!resp.ok) throw new Error(`request failed with status: ${resp.status}`);

      const { code, message, data } = await resp.json();
      if (code !== 0) throw new Error(message || 'Query task failed');

      const task = data as BackendTask;
      const currentStatus = task.status as AITaskStatus;
      setTaskStatus(currentStatus);

      const parsedResult = task.taskInfo ? JSON.parse(task.taskInfo) : null;
      let imageUrls: string[] = [];

      if (parsedResult) {
         const output = parsedResult.output ?? parsedResult.images ?? parsedResult.data;
         if (typeof output === 'string') imageUrls = [output];
         if (Array.isArray(output)) imageUrls = output.filter(i => typeof i === 'string');
      }

      if (currentStatus === AITaskStatus.PENDING) {
        setProgress((prev) => Math.max(prev, 20));
        return false;
      }

      if (currentStatus === AITaskStatus.PROCESSING) {
        if (imageUrls.length > 0) {
          setGeneratedImages(imageUrls.map((url, index) => ({ id: `${task.id}-${index}`, url })));
          setProgress(85);
        } else {
          setProgress((prev) => Math.min(prev + 10, 80));
        }
        return false;
      }

      if (currentStatus === AITaskStatus.SUCCESS) {
        if (imageUrls.length === 0) {
          toast.error('The provider returned no images. Please retry.');
        } else {
          setGeneratedImages(imageUrls.map((url, index) => ({ id: `${task.id}-${index}`, url })));
          toast.success('Ideal partner generated successfully!');
        }
        setProgress(100);
        resetTaskState();
        return true;
      }

      if (currentStatus === AITaskStatus.FAILED) {
        toast.error(parsedResult?.errorMessage || 'Generation failed');
        resetTaskState();
        fetchUserCredits();
        return true;
      }

      setProgress((prev) => Math.min(prev + 5, 95));
      return false;
    } catch (error: any) {
      console.error('Error polling image task:', error);
      toast.error(`Query task failed: ${error.message}`);
      resetTaskState();
      fetchUserCredits();
      return true;
    }
  };

  useEffect(() => {
    if (!taskId || !isGenerating) return;
    let cancelled = false;

    const tick = async () => {
      if (!taskId) return;
      const completed = await pollTaskStatus(taskId);
      if (completed) cancelled = true;
    };
    tick();

    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) clearInterval(interval);
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, isGenerating, pollTaskStatus]);

  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < costCredits) {
      toast.error('Insufficient credits.');
      return;
    }

    if (!birthdate) {
      toast.error('Please enter your birthdate.');
      return;
    }
    
    if (!preference) {
      toast.error('Please select a preference.');
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);
    setGenerationStartTime(Date.now());

    // Construct the prompt
    let builtPrompt = `A realistic portrait photography of an ideal romantic partner for someone born on ${birthdate}, preference: ${preference}. Cosmic, ethereal, highly detailed, beautiful, cinematic lighting.`;
    if (additionalPrompt.trim()) {
      builtPrompt += ` Specific traits desired: ${additionalPrompt}`;
    }

    try {
      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaType: AIMediaType.IMAGE,
          scene: 'text-to-image',
          provider: 'replicate',
          model: 'google/nano-banana-pro',
          prompt: builtPrompt,
          options: {},
        }),
      });

      if (!resp.ok) throw new Error(`request failed with status: ${resp.status}`);

      const { code, message, data } = await resp.json();
      if (code !== 0) throw new Error(message || 'Failed to create an image task');

      const newTaskId = data?.id;
      if (!newTaskId) throw new Error('Task id missing in response');

      setTaskId(newTaskId);
      setProgress(25);
      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      toast.error(`Failed to generate image: ${error.message}`);
      resetTaskState();
    }
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    if (!image.url) return;
    try {
      setDownloadingImageId(image.id);
      const resp = await fetch(`/api/proxy/file?url=${encodeURIComponent(image.url)}`);
      if (!resp.ok) throw new Error('Failed to fetch image');

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `ideal-partner-${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, 2));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  return (
    <section className={cn('py-16 md:py-24', className)}>
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader>
                {srOnlyTitle && <h2 className="sr-only">{srOnlyTitle}</h2>}
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  {t('title')}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{t('description')}</p>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                {step === 0 && (
                  <div className="space-y-6 text-center py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-2xl font-bold">{t('wizard.step1_title')}</h3>
                    <p className="text-muted-foreground">{t('wizard.step1_desc')}</p>
                    <Button size="lg" className="w-full mt-4" onClick={nextStep}>
                      {t('wizard.start_btn')}
                    </Button>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">{t('wizard.step2_title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('wizard.step2_desc')}</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthdate">{t('form.birthdate')}</Label>
                      <Input
                        id="birthdate"
                        type="date"
                        value={birthdate}
                        onChange={(e) => setBirthdate(e.target.value)}
                        className="h-12 text-lg"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" className="flex-1" onClick={prevStep}>
                        {t('wizard.back_btn')}
                      </Button>
                      <Button className="flex-1" onClick={nextStep} disabled={!birthdate}>
                        {t('wizard.next_btn')}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold mb-2">{t('wizard.step3_title')}</h3>
                      <p className="text-sm text-muted-foreground">{t('wizard.step3_desc')}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('form.preference')}</Label>
                        <Select value={preference} onValueChange={setPreference}>
                          <SelectTrigger className="w-full h-12">
                            <SelectValue placeholder={t('form.select_preference')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">{t('form.male')}</SelectItem>
                            <SelectItem value="female">{t('form.female')}</SelectItem>
                            <SelectItem value="non-binary">{t('form.non_binary')}</SelectItem>
                            <SelectItem value="any">{t('form.any')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additional-prompt">{t('form.prompt')}</Label>
                        <Textarea
                          id="additional-prompt"
                          value={additionalPrompt}
                          onChange={(e) => setAdditionalPrompt(e.target.value)}
                          placeholder={t('form.prompt_placeholder')}
                          className="min-h-24 resize-none"
                        />
                      </div>
                    </div>

                    <div className="pt-4 space-y-4">
                      {!isMounted ? (
                        <Button className="w-full h-12" disabled size="lg">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('loading')}
                        </Button>
                      ) : isCheckSign ? (
                        <Button className="w-full h-12" disabled size="lg">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('checking_account')}
                        </Button>
                      ) : user ? (
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 h-12" onClick={prevStep} disabled={isGenerating}>
                            {t('wizard.back_btn')}
                          </Button>
                          <Button
                            size="lg"
                            className="flex-[2] h-12"
                            onClick={handleGenerate}
                            disabled={isGenerating || isPromptTooLong || !preference}
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('generating')}
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                {t('generate')}
                              </>
                            )}
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-3">
                          <Button variant="outline" className="flex-1 h-12" onClick={prevStep}>
                            {t('wizard.back_btn')}
                          </Button>
                          <Button
                            size="lg"
                            className="flex-[2] h-12"
                            onClick={() => setIsShowSignModal(true)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            {t('sign_in_to_generate')}
                          </Button>
                        </div>
                      )}

                      {/* Credits Indicator */}
                      {isMounted && user && remainingCredits > 0 ? (
                        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                          <span className="text-primary">{t('credits_cost', { credits: costCredits })}</span>
                          <span>{t('credits_remaining', { credits: remainingCredits })}</span>
                        </div>
                      ) : isMounted && user && remainingCredits <= 0 ? (
                        <div className="space-y-3 mt-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
                            <span className="text-destructive font-bold">{t('credits_cost', { credits: costCredits })}</span>
                            <span className="text-destructive">{t('credits_remaining', { credits: remainingCredits })}</span>
                          </div>
                          <Link href="/pricing">
                            <Button variant="outline" className="w-full h-10 border-primary/50 text-primary hover:bg-primary/10">
                              <CreditCard className="mr-2 h-4 w-4" />
                              {t('buy_credits')}
                            </Button>
                          </Link>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                
                {/* Step Indicators (Numbered) */}
                <div className="flex justify-between items-center mt-12 px-2 relative">
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-primary/20 z-0"></div>
                  
                  {[
                    { id: 0, label: "Welcome" },
                    { id: 1, label: "Origin" },
                    { id: 2, label: "Intent" }
                  ].map((s) => (
                    <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
                      <div 
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2", 
                          step === s.id 
                            ? "bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]" 
                            : step > s.id 
                              ? "bg-primary/20 border-primary text-primary" 
                              : "bg-background border-primary/20 text-muted-foreground"
                        )}
                      >
                        {step > s.id ? <Sparkles className="w-4 h-4" /> : s.id + 1}
                      </div>
                      <span className={cn(
                        "text-[10px] uppercase font-mono tracking-wider absolute -bottom-5 text-nowrap transition-colors",
                        step === s.id ? "text-primary font-bold" : "text-muted-foreground/60"
                      )}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                  <ImageIcon className="h-5 w-5" />
                  {t('generated_images')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8 min-h-[400px] flex flex-col justify-center">
                {isGenerating ? (
                  <AstrologyLoader isLoading={true} durationMs={15000} className="my-auto" />
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-12">
                  <div className="bg-black/20 backdrop-blur-xl rounded-3xl p-6 border border-primary/10 flex flex-col items-center">
                    <h4 className="text-lg font-mono text-primary/80 mb-6 uppercase tracking-[0.2em] text-center">
                      <Sparkles className="inline-block w-4 h-4 mr-2 mb-1" />
                      Synastry Blueprint
                    </h4>
                    <AstroWheel width={450} height={450} />
                  </div>
                  <div
                    className={
                      generatedImages.length === 1
                        ? 'grid grid-cols-1 gap-6'
                        : 'grid gap-6 sm:grid-cols-2'
                    }
                  >
                    {generatedImages.map((image) => (
                      <div key={image.id} className="space-y-3">
                        <div
                          className={
                            generatedImages.length === 1
                              ? 'relative overflow-hidden rounded-lg border'
                              : 'relative aspect-square overflow-hidden rounded-lg border'
                          }
                        >
                          <LazyImage
                            src={image.url}
                            alt="Generated Ideal Partner"
                            className={
                              generatedImages.length === 1
                                ? 'h-auto w-full'
                                : 'h-full w-full object-cover'
                            }
                          />

                          <div className="absolute right-2 bottom-2 flex justify-end text-sm">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="ml-auto bg-black/50 hover:bg-black/70 text-white"
                              onClick={() => handleDownloadImage(image)}
                              disabled={downloadingImageId === image.id}
                            >
                              {downloadingImageId === image.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* The Blurred Paywall */}
                  <div className="mt-8 border-t border-primary/20 pt-8 relative overflow-hidden">
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#F5EBBA] to-primary uppercase tracking-wider">{t('paywall.title')}</h3>
                      <p className="text-sm text-primary/80 mt-1">{t('paywall.subtitle')}</p>
                    </div>
                    
                    <div className="space-y-4 mb-12 relative z-10">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground/90">{t(`paywall.locked_items.${i}`)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background via-background/90 to-transparent z-20 flex flex-col items-center justify-end pb-4 pt-12">
                      <div className="mb-6 px-6 text-center max-w-sm italic text-sm text-muted-foreground opacity-80 border-l-2 border-primary/30 py-2">
                        {t('paywall.testimonial_quote')}
                        <br/><br/>— {t('paywall.testimonial_author')}
                      </div>
                      <Link href="/pricing" className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto px-8 gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all">
                          <Lock className="w-4 h-4" />
                          {t('paywall.unlock_btn')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center h-full">
                    <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <ImageIcon className="text-muted-foreground h-10 w-10" />
                    </div>
                    <p className="text-muted-foreground">
                      {isGenerating
                        ? t('ready_to_generate')
                        : t('no_images_generated')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
