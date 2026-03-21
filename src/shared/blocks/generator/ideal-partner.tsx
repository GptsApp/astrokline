'use client';

import { useEffect, useMemo, useState } from 'react';
import { AstroWheel } from '@/components/astrokline/charts/astro-wheel';
import { AstrologyLoader } from '@/components/astrokline/ui/theatrical-loader';
import {
  CheckCircle2,
  CreditCard,
  Download,
  ImageIcon,
  Loader2,
  Lock,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { LazyImage } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
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
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';

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
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

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
      if (
        generationStartTime &&
        Date.now() - generationStartTime > GENERATION_TIMEOUT
      ) {
        resetTaskState();
        toast.error('Image generation timed out. Please try again.');
        return true;
      }

      const resp = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id }),
      });

      if (!resp.ok)
        throw new Error(`request failed with status: ${resp.status}`);

      const { code, message, data } = await resp.json();
      if (code !== 0) throw new Error(message || 'Query task failed');

      const task = data as BackendTask;
      const currentStatus = task.status as AITaskStatus;
      setTaskStatus(currentStatus);

      const parsedResult = task.taskInfo ? JSON.parse(task.taskInfo) : null;
      let imageUrls: string[] = [];

      if (parsedResult) {
        const output =
          parsedResult.output ?? parsedResult.images ?? parsedResult.data;
        if (typeof output === 'string') imageUrls = [output];
        if (Array.isArray(output))
          imageUrls = output.filter((i) => typeof i === 'string');
      }

      if (currentStatus === AITaskStatus.PENDING) {
        setProgress((prev) => Math.max(prev, 20));
        return false;
      }

      if (currentStatus === AITaskStatus.PROCESSING) {
        if (imageUrls.length > 0) {
          setGeneratedImages(
            imageUrls.map((url, index) => ({ id: `${task.id}-${index}`, url }))
          );
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
          setGeneratedImages(
            imageUrls.map((url, index) => ({ id: `${task.id}-${index}`, url }))
          );
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

      if (!resp.ok)
        throw new Error(`request failed with status: ${resp.status}`);

      const { code, message, data } = await resp.json();
      if (code !== 0)
        throw new Error(message || 'Failed to create an image task');

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
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(image.url)}`
      );
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

  const nextStep = () => setStep((s) => Math.min(s + 1, 2));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

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
                <p className="text-muted-foreground text-sm">
                  {t('description')}
                </p>
              </CardHeader>
              <CardContent className="space-y-6 pb-8">
                {step === 0 && (
                  <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 py-8 text-center duration-500">
                    <div className="bg-primary/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                      <Sparkles className="text-primary h-8 w-8" />
                    </div>
                    <h3 className="text-2xl font-bold">
                      {t('wizard.step1_title')}
                    </h3>
                    <p className="text-muted-foreground">
                      {t('wizard.step1_desc')}
                    </p>
                    <Button
                      size="lg"
                      className="mt-4 w-full"
                      onClick={nextStep}
                    >
                      {t('wizard.start_btn')}
                    </Button>
                  </div>
                )}

                {step === 1 && (
                  <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
                    <div className="mb-6 text-center">
                      <h3 className="mb-2 text-xl font-bold">
                        {t('wizard.step2_title')}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {t('wizard.step2_desc')}
                      </p>
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
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={prevStep}
                      >
                        {t('wizard.back_btn')}
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={nextStep}
                        disabled={!birthdate}
                      >
                        {t('wizard.next_btn')}
                      </Button>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="animate-in fade-in slide-in-from-right-4 space-y-6 duration-500">
                    <div className="mb-6 text-center">
                      <h3 className="mb-2 text-xl font-bold">
                        {t('wizard.step3_title')}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {t('wizard.step3_desc')}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('form.preference')}</Label>
                        <Select
                          value={preference}
                          onValueChange={setPreference}
                        >
                          <SelectTrigger className="h-12 w-full">
                            <SelectValue
                              placeholder={t('form.select_preference')}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">
                              {t('form.male')}
                            </SelectItem>
                            <SelectItem value="female">
                              {t('form.female')}
                            </SelectItem>
                            <SelectItem value="non-binary">
                              {t('form.non_binary')}
                            </SelectItem>
                            <SelectItem value="any">{t('form.any')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additional-prompt">
                          {t('form.prompt')}
                        </Label>
                        <Textarea
                          id="additional-prompt"
                          value={additionalPrompt}
                          onChange={(e) => setAdditionalPrompt(e.target.value)}
                          placeholder={t('form.prompt_placeholder')}
                          className="min-h-24 resize-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      {!isMounted ? (
                        <Button className="h-12 w-full" disabled size="lg">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('loading')}
                        </Button>
                      ) : isCheckSign ? (
                        <Button className="h-12 w-full" disabled size="lg">
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t('checking_account')}
                        </Button>
                      ) : user ? (
                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            className="h-12 flex-1"
                            onClick={prevStep}
                            disabled={isGenerating}
                          >
                            {t('wizard.back_btn')}
                          </Button>
                          <Button
                            size="lg"
                            className="h-12 flex-[2]"
                            onClick={handleGenerate}
                            disabled={
                              isGenerating || isPromptTooLong || !preference
                            }
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
                          <Button
                            variant="outline"
                            className="h-12 flex-1"
                            onClick={prevStep}
                          >
                            {t('wizard.back_btn')}
                          </Button>
                          <Button
                            size="lg"
                            className="h-12 flex-[2]"
                            onClick={() => setIsShowSignModal(true)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            {t('sign_in_to_generate')}
                          </Button>
                        </div>
                      )}

                      {/* Credits Indicator */}
                      {isMounted && user && remainingCredits > 0 ? (
                        <div className="text-muted-foreground flex items-center justify-between px-1 text-xs">
                          <span className="text-primary">
                            {t('credits_cost', { credits: costCredits })}
                          </span>
                          <span>
                            {t('credits_remaining', {
                              credits: remainingCredits,
                            })}
                          </span>
                        </div>
                      ) : isMounted && user && remainingCredits <= 0 ? (
                        <div className="mt-2 space-y-3">
                          <div className="text-muted-foreground flex items-center justify-between px-1 text-xs">
                            <span className="text-destructive font-bold">
                              {t('credits_cost', { credits: costCredits })}
                            </span>
                            <span className="text-destructive">
                              {t('credits_remaining', {
                                credits: remainingCredits,
                              })}
                            </span>
                          </div>
                          <Link href="/pricing">
                            <Button
                              variant="outline"
                              className="border-primary/50 text-primary hover:bg-primary/10 h-10 w-full"
                            >
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
                <div className="relative mt-12 flex items-center justify-between px-2">
                  <div className="bg-primary/20 absolute top-1/2 right-0 left-0 z-0 h-0.5 -translate-y-1/2"></div>

                  {[
                    { id: 0, label: 'Welcome' },
                    { id: 1, label: 'Origin' },
                    { id: 2, label: 'Intent' },
                  ].map((s) => (
                    <div
                      key={s.id}
                      className="relative z-10 flex flex-col items-center gap-2"
                    >
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                          step === s.id
                            ? 'bg-primary border-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                            : step > s.id
                              ? 'bg-primary/20 border-primary text-primary'
                              : 'bg-background border-primary/20 text-muted-foreground'
                        )}
                      >
                        {step > s.id ? (
                          <Sparkles className="h-4 w-4" />
                        ) : (
                          s.id + 1
                        )}
                      </div>
                      <span
                        className={cn(
                          'absolute -bottom-5 font-mono text-[10px] tracking-wider text-nowrap uppercase transition-colors',
                          step === s.id
                            ? 'text-primary font-bold'
                            : 'text-muted-foreground/60'
                        )}
                      >
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
              <CardContent className="flex min-h-[400px] flex-col justify-center pb-8">
                {isGenerating ? (
                  <AstrologyLoader
                    isLoading={true}
                    durationMs={15000}
                    className="my-auto"
                  />
                ) : generatedImages.length > 0 ? (
                  <div className="space-y-12">
                    <div className="border-primary/10 flex flex-col items-center rounded-3xl border bg-black/20 p-6 backdrop-blur-xl">
                      <h4 className="text-primary/80 mb-6 text-center font-mono text-lg tracking-[0.2em] uppercase">
                        <Sparkles className="mr-2 mb-1 inline-block h-4 w-4" />
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
                                className="ml-auto bg-black/50 text-white hover:bg-black/70"
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
                    <div className="border-primary/20 relative mt-8 overflow-hidden border-t pt-8">
                      <div className="mb-6 text-center">
                        <h3 className="to-primary bg-gradient-to-r from-[#F5EBBA] bg-clip-text text-xl font-bold tracking-wider text-transparent uppercase">
                          {t('paywall.title')}
                        </h3>
                        <p className="text-primary/80 mt-1 text-sm">
                          {t('paywall.subtitle')}
                        </p>
                      </div>

                      <div className="relative z-10 mb-12 space-y-4">
                        {[0, 1, 2].map((i) => (
                          <div
                            key={i}
                            className="bg-primary/5 border-primary/10 flex items-start gap-3 rounded-lg border p-3"
                          >
                            <CheckCircle2 className="text-primary mt-0.5 h-5 w-5 shrink-0" />
                            <span className="text-foreground/90 text-sm">
                              {t(`paywall.locked_items.${i}`)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="from-background via-background/90 absolute right-0 bottom-0 left-0 z-20 flex h-64 flex-col items-center justify-end bg-gradient-to-t to-transparent pt-12 pb-4">
                        <div className="text-muted-foreground border-primary/30 mb-6 max-w-sm border-l-2 px-6 py-2 text-center text-sm italic opacity-80">
                          {t('paywall.testimonial_quote')}
                          <br />
                          <br />— {t('paywall.testimonial_author')}
                        </div>
                        <Link href="/pricing" className="w-full sm:w-auto">
                          <Button
                            size="lg"
                            className="w-full gap-2 px-8 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] sm:w-auto"
                          >
                            <Lock className="h-4 w-4" />
                            {t('paywall.unlock_btn')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-16 text-center">
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
