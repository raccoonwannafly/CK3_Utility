
import React, { useState } from 'react';
import { CharacterBuild } from '../types';
import { saveToGallery } from '../services/geminiService';
import { compressImage } from '../utils';

interface RoyalAdvisorProps {
  build: CharacterBuild;
}

const RoyalAdvisor: React.FC<RoyalAdvisorProps> = ({ build }) => {
  const [bio, setBio] = useState('');
  const [motto, setMotto] = useState('');
  const [dna, setDna] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Saving State
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const handleSaveToGallery = async () => {
    setSaving(true);
    try {
      await saveToGallery({
        ...build,
        dna: dna,
        images: imageUrl ? [imageUrl] : [],
        bio: bio,
        dynastyMotto: motto
      });
      setSaveMsg("Character enshrined in the Archives.");
    } catch (e) {
      setSaveMsg("Failed to save to archives.");
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMsg(null), 3000);
    }
  };


  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    const imageItems = Array.from(items).filter(item => item.type.indexOf('image') !== -1);

    if (imageItems.length === 0) return;

    e.preventDefault();

    try {
      const files = imageItems.map(item => item.getAsFile()).filter((f): f is File => f !== null);
      if (files.length > 0) {
        const base64 = await compressImage(files[0]);
        setImageUrl(base64);
      }
    } catch (err) {
      console.error("Paste failed:", err);
    }
  };
  return (
    <div
      className="max-w-4xl mx-auto space-y-12 animate-fade-in pb-20 outline-none"
      onPaste={handlePaste}
      tabIndex={0}
    >
      <header className="text-center space-y-4">
        <h2 className="text-4xl font-serif text-ck3-gold">Character Sheet</h2>
        <p className="text-stone-400 max-w-2xl mx-auto">
          Finalize your character's details, biography, and appearance before saving them to the Royal Archives.
        </p>
      </header>

      {/* Input Summary */}
      <div className="bg-stone-900/50 p-6 rounded-lg border border-stone-800 text-center">
        <h3 className="text-sm font-bold text-stone-500 uppercase tracking-widest mb-4">Current Subject</h3>
        <div className="flex flex-wrap justify-center gap-4 text-stone-300">
          <span className="px-3 py-1 bg-stone-800 rounded border border-stone-700">
            <span className="text-stone-500 mr-2">Name:</span> {build.name || "Unknown"}
          </span>
          <span className="px-3 py-1 bg-stone-800 rounded border border-stone-700">
            <span className="text-stone-500 mr-2">Goal:</span> {build.goal || "None specified"}
          </span>
          <span className="px-3 py-1 bg-stone-800 rounded border border-stone-700">
            <span className="text-stone-500 mr-2">Traits:</span> {build.traits.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LORE SECTION */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif text-ck3-gold border-b border-stone-700 pb-2">Biography & Details</h3>

          <div className="bg-stone-900/30 p-6 rounded-lg border border-stone-800 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Dynasty Motto</label>
              <input
                type="text"
                value={motto}
                onChange={(e) => setMotto(e.target.value)}
                placeholder="e.g. Iron and Blood"
                className="w-full bg-black/50 border border-stone-700 rounded p-3 text-sm text-stone-300 focus:border-ck3-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Biography / Lore</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write the history and personality of this ruler..."
                className="w-full h-40 bg-black/50 border border-stone-700 rounded p-3 text-sm text-stone-300 focus:border-ck3-gold outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* VISUALS SECTION */}
        <div className="space-y-6">
          <h3 className="text-2xl font-serif text-ck3-gold border-b border-stone-700 pb-2">Visuals & DNA</h3>

          <div className="bg-stone-900/30 rounded border border-stone-800 p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Character DNA (Base64)</label>
              <textarea
                value={dna}
                onChange={(e) => setDna(e.target.value)}
                placeholder="Paste persistent DNA string here..."
                className="w-full h-24 bg-black/50 border border-stone-700 rounded p-3 text-xs font-mono text-stone-400 focus:border-ck3-gold outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase mb-2">Portrait Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-black/50 border border-stone-700 rounded p-3 text-sm text-stone-300 focus:border-ck3-gold outline-none"
              />
            </div>
          </div>

          {/* Portrait Display */}
          <div className="aspect-[3/4] bg-black/40 rounded-lg border-2 border-stone-700 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            {imageUrl ? (
              <>
                <img src={imageUrl} alt="Character Portrait" className="w-full h-full object-cover animate-fade-in" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-6 flex-col gap-2">
                  <button onClick={handleSaveToGallery} disabled={saving} className="bg-ck3-gold/90 hover:bg-ck3-gold text-white px-4 py-2 rounded text-xs font-bold uppercase w-full">
                    {saving ? "Archiving..." : "Save to Gallery"}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="text-4xl mb-4 opacity-20">👤</div>
                <p className="text-stone-600 text-sm">Portrait preview</p>
                <button onClick={handleSaveToGallery} disabled={saving} className="mt-4 bg-stone-800 hover:bg-stone-700 text-stone-300 px-4 py-2 rounded text-xs font-bold uppercase">
                  {saving ? "Archiving..." : "Save without Image"}
                </button>
              </div>
            )}
            {saveMsg && (
              <div className="absolute top-4 left-4 right-4 bg-emerald-900/90 text-white text-xs p-2 rounded text-center animate-fade-in">
                {saveMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoyalAdvisor;
