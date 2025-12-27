import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Settings,
    Key,
    Check,
    AlertCircle,
    Loader2,
    Eye,
    EyeOff,
    TestTube
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
    LLMProvider,
    LLMConfig,
    DEFAULT_MODELS,
    DEFAULT_BASE_URLS,
    PROVIDER_INFO,
    chat
} from '@/lib/llmProvider';

interface LLMSettings {
    llm_provider: LLMProvider;
    llm_api_key: string | null;
    llm_model: string | null;
    llm_base_url: string | null;
}

export function LLMSettingsPanel() {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);

    const [settings, setSettings] = useState<LLMSettings>({
        llm_provider: 'gemini',
        llm_api_key: null,
        llm_model: null,
        llm_base_url: null
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Try to get existing settings using type assertion for new table
            const { data, error } = await (supabase as any)
                .from('user_settings')
                .select('llm_provider, llm_api_key, llm_model, llm_base_url')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setSettings({
                    llm_provider: data.llm_provider || 'gemini',
                    llm_api_key: data.llm_api_key || null,
                    llm_model: data.llm_model || null,
                    llm_base_url: data.llm_base_url || null
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveSettings = async () => {
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast({ title: 'Error', description: 'Not authenticated', variant: 'destructive' });
                return;
            }

            const { error } = await (supabase as any)
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    llm_provider: settings.llm_provider,
                    llm_api_key: settings.llm_api_key,
                    llm_model: settings.llm_model,
                    llm_base_url: settings.llm_base_url,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

            if (error) throw error;

            toast({ title: 'Settings saved', description: 'Your LLM configuration has been updated.' });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    const testConnection = async () => {
        setIsTesting(true);
        setTestResult(null);
        try {
            const config: LLMConfig = {
                provider: settings.llm_provider,
                apiKey: settings.llm_api_key || undefined,
                model: settings.llm_model || undefined,
                baseUrl: settings.llm_base_url || undefined
            };

            await chat(config, [
                { role: 'user', content: 'Say "Hello" in one word.' }
            ]);

            setTestResult('success');
            toast({ title: 'Connection successful', description: 'Your LLM API is working correctly!' });
        } catch (error) {
            console.error('Test failed:', error);
            setTestResult('error');
            toast({
                title: 'Connection failed',
                description: error instanceof Error ? error.message : 'Failed to connect to LLM',
                variant: 'destructive'
            });
        } finally {
            setIsTesting(false);
        }
    };

    const currentProvider = PROVIDER_INFO[settings.llm_provider];

    if (isLoading) {
        return (
            <Card className="border-border bg-card/50">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-border bg-card/50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-primary" />
                    AI Model Settings
                </CardTitle>
                <CardDescription>
                    Configure which LLM to use for architecture generation. You can use your own API key.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Provider Selection */}
                <div className="space-y-2">
                    <Label>AI Provider</Label>
                    <Select
                        value={settings.llm_provider}
                        onValueChange={(value) => setSettings(prev => ({
                            ...prev,
                            llm_provider: value as LLMProvider,
                            llm_model: null, // Reset model when provider changes
                            llm_base_url: null
                        }))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {(Object.keys(PROVIDER_INFO) as LLMProvider[]).map(provider => (
                                <SelectItem key={provider} value={provider}>
                                    <div className="flex items-center gap-2">
                                        <span>{PROVIDER_INFO[provider].name}</span>
                                        {!PROVIDER_INFO[provider].requiresKey && (
                                            <Badge variant="secondary" className="text-xs">Local</Badge>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">{currentProvider.description}</p>
                </div>

                {/* API Key */}
                {currentProvider.requiresKey && (
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Key className="w-4 h-4" />
                            API Key
                        </Label>
                        <div className="relative">
                            <Input
                                type={showApiKey ? 'text' : 'password'}
                                placeholder="Enter your API key"
                                value={settings.llm_api_key || ''}
                                onChange={(e) => setSettings(prev => ({ ...prev, llm_api_key: e.target.value }))}
                                className="pr-10"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={() => setShowApiKey(!showApiKey)}
                            >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your API key is stored securely and only used for architecture generation.
                        </p>
                    </div>
                )}

                {/* Model Selection */}
                <div className="space-y-2">
                    <Label>Model</Label>
                    <Input
                        placeholder={DEFAULT_MODELS[settings.llm_provider]}
                        value={settings.llm_model || ''}
                        onChange={(e) => setSettings(prev => ({ ...prev, llm_model: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                        Leave blank to use default: <code>{DEFAULT_MODELS[settings.llm_provider]}</code>
                    </p>
                </div>

                {/* Custom Base URL (for Ollama/Custom) */}
                {(settings.llm_provider === 'ollama' || settings.llm_provider === 'custom') && (
                    <div className="space-y-2">
                        <Label>Base URL</Label>
                        <Input
                            placeholder={DEFAULT_BASE_URLS[settings.llm_provider]}
                            value={settings.llm_base_url || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, llm_base_url: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground">
                            {settings.llm_provider === 'ollama'
                                ? 'Default: http://localhost:11434/api'
                                : 'Enter your OpenAI-compatible API endpoint'}
                        </p>
                    </div>
                )}

                {/* Test Connection Result */}
                {testResult && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${testResult === 'success'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                        {testResult === 'success' ? (
                            <>
                                <Check className="w-4 h-4" />
                                <span>Connection successful!</span>
                            </>
                        ) : (
                            <>
                                <AlertCircle className="w-4 h-4" />
                                <span>Connection failed. Check your API key and settings.</span>
                            </>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={testConnection}
                        variant="outline"
                        disabled={isTesting || (currentProvider.requiresKey && !settings.llm_api_key)}
                    >
                        {isTesting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <TestTube className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                    </Button>
                    <Button onClick={saveSettings} disabled={isSaving}>
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <Check className="w-4 h-4 mr-2" />
                        )}
                        Save Settings
                    </Button>
                </div>

                {/* Provider Quick Links */}
                <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">Get API Keys:</p>
                    <div className="flex flex-wrap gap-2">
                        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
                            Google AI Studio
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
                            OpenAI
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a href="https://console.anthropic.com/" target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
                            Anthropic
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a href="https://console.x.ai/" target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
                            xAI Grok
                        </a>
                        <span className="text-muted-foreground">•</span>
                        <a href="https://ollama.ai/" target="_blank" rel="noopener" className="text-xs text-primary hover:underline">
                            Ollama (Local)
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
