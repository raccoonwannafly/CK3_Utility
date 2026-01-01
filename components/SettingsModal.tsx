
import React from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    isPersistentMode: boolean;
    setPersistentMode: (value: boolean) => void;
    designSettings?: { enableAnimations: boolean; enableGlassmorphism: boolean; enable3DTilt: boolean; enableImmersiveFonts: boolean };
    onDesignSettingsChange?: (settings: any) => void;
}

export default function SettingsModal({ isOpen, onClose, isPersistentMode, setPersistentMode, designSettings, onDesignSettingsChange }: SettingsModalProps) {
    if (!isOpen) return null;

    const toggleSetting = (key: string) => {
        if (designSettings && onDesignSettingsChange) {
            onDesignSettingsChange({ ...designSettings, [key]: !designSettings[key as keyof typeof designSettings] });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-stone-900 border border-stone-700 p-6 rounded-lg shadow-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-stone-400 hover:text-white"
                >
                    ✕
                </button>
                <h2 className="text-xl font-serif text-amber-500 mb-4 border-b border-stone-700 pb-2">Settings</h2>

                <div className="space-y-6">
                    {/* Database Settings */}
                    <div>
                        <h3 className="text-sm uppercase font-bold text-stone-500 mb-3">Database</h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-stone-200 font-bold">Persistent Edit Mode</h3>
                                <p className="text-stone-500 text-xs mt-1 max-w-[250px]">
                                    Save historical edits to server file. <span className="text-amber-700 font-bold">Dev Only</span>
                                </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isPersistentMode}
                                    onChange={(e) => setPersistentMode(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-stone-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                            </label>
                        </div>
                    </div>

                    {/* Design Settings */}
                    {designSettings && (
                        <div>
                            <h3 className="text-sm uppercase font-bold text-stone-500 mb-3">Visual Fidelity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-stone-300 text-sm font-bold">Immersive Fonts</h3>
                                        <p className="text-stone-500 text-[10px]">Use Uncial Antiqua / MedievalSharp headers</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={designSettings.enableImmersiveFonts}
                                            onChange={() => toggleSetting('enableImmersiveFonts')}
                                        />
                                        <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-stone-300 text-sm font-bold">Animations</h3>
                                        <p className="text-stone-500 text-[10px]">Enable smooth layout transitions</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={designSettings.enableAnimations}
                                            onChange={() => toggleSetting('enableAnimations')}
                                        />
                                        <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-stone-300 text-sm font-bold">3D Card Tilt</h3>
                                        <p className="text-stone-500 text-[10px]">Cards react to cursor movement</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={designSettings.enable3DTilt}
                                            onChange={() => toggleSetting('enable3DTilt')}
                                        />
                                        <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-stone-300 text-sm font-bold">Glassmorphism</h3>
                                        <p className="text-stone-500 text-[10px]">Premium frosted glass effects</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={designSettings.enableGlassmorphism}
                                            onChange={() => toggleSetting('enableGlassmorphism')}
                                        />
                                        <div className="w-9 h-5 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded border border-stone-600 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
