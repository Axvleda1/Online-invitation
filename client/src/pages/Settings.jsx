import { useEffect, useState } from 'react';
import useSettingsStore from '../store/settingsStore';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const Section = ({ title, subtitle, children }) => (
  <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-lg">
    <div className="px-5 py-4 border-b border-gray-700/70">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, label, hint }) => (
  <div className="flex items-start justify-between gap-4 py-1">
    <div>
      <label className="block text-sm font-medium text-gray-200">{label}</label>
      {hint && <p className="text-xs text-gray-400 mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
        checked ? 'bg-tech-blue' : 'bg-gray-600'
      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-tech-blue/40 focus:ring-offset-gray-900`}
      aria-pressed={checked}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

const ColorField = ({ label, value, onChange, hint }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 rounded border border-gray-600 cursor-pointer"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-tech-blue"
        placeholder="#ffffff or rgba(...)"
      />
    </div>
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
);

const TextField = ({ label, value, onChange, placeholder }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-tech-blue"
    />
  </div>
);

const Settings = () => {
  const { isAdmin, isAuthenticated } = useAuthStore();
  
  const {
    logoText,
    subtitleText,
    goingButtonText,
    cantGoButtonText,
    dressCodeLabel,
    addressLabel,
    eventAgendaLabel,
    guestInfoLabel,
    goingButtonColor,
    goingButtonTextColor,
    goingButtonHoverColor,
    cantGoButtonColor,
    cantGoButtonTextColor,
    cantGoButtonBorderColor,
    cantGoButtonHoverColor,
    logoImage,
    loading,
    error,
    fetchSettings,
    updateLogoText,
    updateSubtitleText,
    updateGoingButtonText,
    updateCantGoButtonText,
    updateDressCodeLabel,
    updateAddressLabel,
    updateEventAgendaLabel,
    updateGuestInfoLabel,
    updateGoingButtonColor,
    updateGoingButtonTextColor,
    updateGoingButtonHoverColor,
    updateCantGoButtonColor,
    updateCantGoButtonTextColor,
    updateCantGoButtonBorderColor,
    updateCantGoButtonHoverColor,
    updateLogoImage,
    showLinearGradient,
    showRadialGradient,
    updateShowLinearGradient,
    updateShowRadialGradient,
    resetToDefaults,
  } = useSettingsStore();

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-[1200px] px-4 sm:px-6 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/80">გთხოვთ, შეიყვანეთ საბუთებზე წვდომისთვის.</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="w-full max-w-[1200px] px-4 sm:px-6 mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="text-white/80">ადმინ წვდომა საჭიროა საბუთების რედაქტირებისთვის.</div>
        </div>
      </div>
    );
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const result = await updateLogoImage(ev.target.result);
      result.success ? toast.success('ლოგო ატვირთვა წარმატებით დასრულდა!') : toast.error(result.error || 'ატვირთვა ვერ მოხერხდა');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => toast.success('საბუთები წარმატებით შენახულია!');
  const handleReset = async () => {
    const result = await resetToDefaults();
    result.success ? toast.success('საბუთები წარმატებით ნულოვანი მონაცემებით დაგროვდა!') : toast.error(result.error || 'საბუთების ნულოვანი მონაცემებით დაგროვდა ვერ მოხერხდა');
  };

  if (loading && !logoText) {
    return (
      <div className="w-full max-w-[1200px] px-4 sm:px-6 mx-auto">
        <div className="flex items-center justify-center h-64 text-white/80">იტვირთება საბუთები…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-[1200px] px-4 sm:px-6 mx-auto">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="text-red-300">{error}</div>
          <button
            onClick={fetchSettings}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            გამეორება
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1500px] px-4 sm:px-6 mx-auto space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">მთავარი გვერდის პარამეტრები</h1>
          <p className="text-gray-400">მთავარი გვერდის გამოსახულების მორგება</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
          <button
            onClick={() => setPreviewMode((v) => !v)}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            {previewMode ? 'რედაქტირების რეჟიმი' : 'პრევიევის რეჟიმი'}
          </button>
          <button
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            ნულოვანი მონაცემები
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-4 py-2 bg-tech-blue text-tech-black font-semibold rounded-lg hover:brightness-95 transition"
          >
            შენახვა
          </button>
        </div>
      </div>

      {previewMode && (
        <Section title="პრევიევი" subtitle="ეს წამოაჩენს თქვენს მიმდინარე პარამეტრებს">
          <div className="relative overflow-hidden rounded-lg border border-gray-700">
            <div className="relative h-[360px] sm:h-[420px] bg-black">
              {showLinearGradient && (
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/90 pointer-events-none" />
              )}
              {showRadialGradient && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(60% 60% at 50% 40%, rgba(255,255,255,0.06) 0%, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.75) 100%)'
                  }}
                />
              )}

              <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-3 px-6 text-center">
                {logoImage ? (
                  <img src={logoImage} alt="Logo" className="max-h-16 sm:max-h-20 object-contain" />
                ) : (
                  <h2 
                    className={`font-extrabold tracking-[0.18em] text-white ${
                      logoText.length <= 6 
                        ? 'responsive-text-large' 
                        : logoText.length <= 10 
                        ? 'responsive-text' 
                        : logoText.length <= 15 
                        ? 'text-lg sm:text-xl md:text-2xl' 
                        : 'text-base sm:text-lg md:text-xl'
                    }`}
                    style={{
                      fontSize: logoText.length > 15 ? `clamp(0.875rem, ${Math.max(2, 8 - logoText.length * 0.3)}vw, 1.5rem)` : undefined
                    }}
                  >
                    {logoText}
                  </h2>
                )}

                <div className="flex items-center justify-center gap-4">
                  <div className="h-px w-12 bg-white/40" />
                  <p className="text-white/90 tracking-[0.35em] uppercase">{subtitleText}</p>
                  <div className="h-px w-12 bg-white/40" />
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    className="group relative px-10 sm:px-14 py-3 font-bold text-lg tracking-wider uppercase rounded-lg transition-transform duration-300 hover:scale-[1.03]"
                    style={{
                      '--bg-color': goingButtonColor,
                      '--hover-color': goingButtonHoverColor,
                      '--text-color': goingButtonTextColor,
                      backgroundColor: 'var(--bg-color)',
                      color: 'var(--text-color)',
                    }}
                  >
                    <span className="relative z-10">{goingButtonText}</span>
                    <span
                      className="absolute inset-0 rounded-lg scale-x-0 group-hover:scale-x-100 origin-left transition-transform"
                      style={{ background: 'var(--hover-color)' }}
                    />
                  </button>

                  <button
                    className="px-10 sm:px-14 py-3 font-bold text-lg tracking-wider uppercase rounded-lg transition-transform duration-300 hover:scale-[1.03]"
                    style={{
                      backgroundColor: cantGoButtonColor,
                      color: cantGoButtonTextColor,
                      border: `2px solid ${cantGoButtonBorderColor}`,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = cantGoButtonHoverColor)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = cantGoButtonColor)}
                  >
                    {cantGoButtonText}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <Section title="ლოგო & ტექსტი">
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">ლოგო სურათი (არასავალდებულო)</label>
              <div className="flex flex-wrap items-center gap-3">
                <input id="logo-upload" type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <label
                  htmlFor="logo-upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  ლოგო ატვირთვა
                </label>
                {logoImage && (
                  <button
                    onClick={() => updateLogoImage(null)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                          წაშლა
                  </button>
                )}
              </div>
              {logoImage && (
                <div className="mt-2">
                  <img src={logoImage} alt="Current logo" className="max-h-14 border border-gray-700 rounded" />
                </div>
              )}
            </div>

            <TextField
              label="მთავარი ლოგო ტექსტი"
              value={logoText}
              onChange={updateLogoText}
              placeholder="შეიყვანეთ მთავარი ლოგო ტექსტი"
            />
            <TextField
              label="ქვედა ტექსტი"
              value={subtitleText}
              onChange={updateSubtitleText}
              placeholder="შეიყვანეთ ქვედა ტექსტი"
            />
          </div>

          <div className="mt-8 space-y-5">
            <h4 className="text-lg font-semibold text-white">ტექსტის რედაქტირება</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField
                label="დრეს კოდის (არასავალდებულო)"
                value={dressCodeLabel}
                onChange={updateDressCodeLabel}
                placeholder="დრეს კოდი"
              />
              <TextField
                label="მისამართის"
                value={addressLabel}
                onChange={updateAddressLabel}
                placeholder="მისამართი"
              />
              <TextField
                label="ღონისძიების წესრიგის  (არასავალდებულო)"
                value={eventAgendaLabel}
                onChange={updateEventAgendaLabel}
                placeholder="ღონისძიების წესრიგი"
              />
              <TextField
                label="დამატებითი ინფორმაცია (არასავალდებულო)"
                value={guestInfoLabel}
                onChange={updateGuestInfoLabel}
                placeholder="დამატებითი ინფორმაცია"
              />
            </div>
          </div>

         <div className="mt-16 space-y-5">
            <Section title="გრადიენტის ხმაურები" subtitle="მთავარი გვერდის გრადიენტის ხმაურების ჩართვა/გამორთვა" >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Toggle
                checked={!!showLinearGradient}
                onChange={async (v) => {
                  console.log('🔄 Toggle linear gradient:', v);
                  const r = await updateShowLinearGradient(v);
                  console.log('📡 Toggle result:', r);
                  if (!r?.success) {
                      toast.error(r?.error || 'ხარისხის გრადიენტის ხმაურის განახლება ვერ მოხერხდა');
                  } else {
                    toast.success('ხარისხის გრადიენტის ხმაურის წარმატებით განახლდა');
                  }
                }}
                label="ფონის ჩამუქება"
              />
              <Toggle
                checked={!!showRadialGradient}
                onChange={async (v) => {
                  console.log('🔄 Toggle radial gradient:', v);
                  const r = await updateShowRadialGradient(v);
                  console.log('📡 Toggle result:', r);
                  if (!r?.success) {
                    toast.error(r?.error || 'რადიალური გრადიენტის ხმაურის განახლება ვერ მოხერხდა');
                  } else {
                    toast.success('რადიალური გრადიენტის ხმაურის წარმატებით განახლდა');
                  }
                }}
                label="ფონის კუთხეების ჩამუქება"
              />
            </div>
          </Section>
          </div>
        </Section>

        <div className="space-y-8">
          <Section title="ღილაკების მორგება">
            <div className="space-y-8">
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-200">მოვდივარ ღილაკი</h4>
                <TextField
                  label="ღილაკის ტექსტი"
                  value={goingButtonText}
                  onChange={updateGoingButtonText}
                  placeholder="მოვდივარ"
                />
                <div className="grid grid-cols-1 gap-5">
                  <ColorField
                    label="ბოქსის ფერი"
                    value={goingButtonColor}
                    onChange={updateGoingButtonColor}
                  />
                  <ColorField
                    label="ტექსტის ფერი"
                    value={goingButtonTextColor}
                    onChange={updateGoingButtonTextColor}
                  />
                  <ColorField
                    label="მართვის ფერი"
                    value={goingButtonHoverColor}
                    onChange={updateGoingButtonHoverColor}
                  />
                </div>
              </div>

              <div className="space-y-4 border-t border-gray-700/70 pt-4">
                <h4 className="text-lg font-medium text-gray-200">ვერ მოვდივარ ღილაკი</h4>
                <TextField
                  label="ღილაკის ტექსტი"
                  value={cantGoButtonText}
                  onChange={updateCantGoButtonText}
                  placeholder="ვერ მოვდივარ"
                />
                <div className="grid grid-cols-1 gap-5">
                  <ColorField
                    label="ბოქსის ფერი"
                    value={cantGoButtonColor}
                    onChange={updateCantGoButtonColor}
                  />
                  <ColorField
                    label="ტექსტის ფერი"
                    value={cantGoButtonTextColor}
                    onChange={updateCantGoButtonTextColor}
                  />
                  <ColorField
                    label="ბორდერის ფერი"
                    value={cantGoButtonBorderColor}
                    onChange={updateCantGoButtonBorderColor}
                  />
                  <ColorField
                    label="მართვის ფერი"
                    value={cantGoButtonHoverColor}
                    onChange={updateCantGoButtonHoverColor}
                  />
                </div>
              </div>
            </div>
          </Section>

          
        </div>
      </div>
    </div>
  );
};

export default Settings;
