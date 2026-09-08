import React from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b1026] text-white flex flex-col items-center justify-between p-4 selection:bg-purple-300 selection:text-purple-950 animate-in fade-in duration-300">
      {/* Golden bokeh ambient circles */}
      <div className="absolute top-12 left-6 w-36 h-36 rounded-full bg-amber-400/25 blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-4 w-44 h-44 rounded-full bg-orange-400/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-28 left-4 w-40 h-40 rounded-full bg-amber-300/25 blur-3xl pointer-events-none"></div>

      {/* Top collage section */}
      <div className="relative w-full max-w-sm mx-auto flex-1 min-h-[520px] flex flex-col items-center justify-center pt-2">
        {/* Collage Card 1: Top Left Girl with Vintage Camera */}
        <div className="absolute top-2 left-0 w-36 h-48 rounded-xl overflow-hidden shadow-2xl border-4 border-black/80 transform -rotate-6 z-10 hover:rotate-0 transition-transform duration-300">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmHihlHKQrIc1OUgOzoMy1PtZz6R8IPe-exHc84gfjZWNjRErDrdCt0PYNQJPVLDqZnfy5vBVjMzITevYYYXsHyy0f1HoKlrp0vmWVKW_562fBBAN8VM8M8TCe-0bTUPTWQ8bjgt8QK-WTEgBc9T3o4hqxtFDKNkcJdD8w2z-zFMfXLomy7_mB6YDu1eousi5IoC7vJaJRQdXnnfHRTER0NZYEfHmx1_LX8ojb173R3wsYKsYZ3c3Z"
            alt="Photographer taking picture"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>

        {/* Collage Card 2: Top Right Viewfinder Grid */}
        <div className="absolute top-4 right-0 w-44 h-32 rounded-xl overflow-hidden shadow-2xl bg-[#9cb7d4] border-4 border-black/80 transform rotate-8 z-10 flex items-center justify-center p-2">
          {/* Viewfinder grid lines */}
          <div className="w-full h-full border border-black/30 grid grid-cols-3 grid-rows-3 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              <span className="text-black/60 font-mono text-xl">+</span>
            </div>
            {/* Viewfinder corners */}
            <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-black/70"></div>
            <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-black/70"></div>
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-black/70"></div>
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-black/70"></div>
          </div>
        </div>

        {/* Collage Card 3: Middle Right Golden Sunset Silhouette */}
        <div className="absolute top-44 right-2 w-32 h-40 rounded-xl overflow-hidden shadow-2xl border-4 border-black/80 transform -rotate-3 z-10">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvFwp1Q7_OIjjAdzE5E4hN33bWgvSYoD782oc9val2lOkbi7bFn1KRPkbwpP1dlSOnrK9yYTDwdoudq9ys-Uvkn5CbOp7bGYsmYSQjvSHMScpVdScZvAvnB_2fe61VL35OlQvebBIV_tm930uiaRgoZzrXngSfqJQWGUscH7k5pZxFMXCqGmCYsbzZM7CbIkfSE-y0HhL3PwIqw3W-1XYXfoEvGFw1koHBOV3TVC-WOJa2pniUFnj1"
            alt="Sunset portrait"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Collage Card 4: Middle Left Group Discussion */}
        <div className="absolute top-48 left-2 w-36 h-36 rounded-xl overflow-hidden shadow-2xl border-4 border-black/80 transform rotate-4 z-10">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqf4o5lVRtEu4h5F3mDucH8p0GZ8pQaiRSTyNMdT1211UHF0ah7yZyPVXwX9lZNr0l3W3FGjW8zIrcOVtfw03iPgmslNNWFU44KJxToJwlgfmSs0MTYrNDX9NV19I_-2iU6dFLDKIuLOjTUdxFO9sS3kF4yrAa-W96T820oqTpWmLrRyt6KULLV7627VW3em0mM72CWnZoV1rwTjfniCoRTtSTwkVc0H0uhiQCsHfqD7Rpd2XsacWQ"
            alt="Photography peers"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Center Title Hook */}
        <div className="relative z-30 text-center px-4 py-8 max-w-[280px]">
          <span className="text-[11px] font-bold tracking-[0.25em] text-purple-200 uppercase block mb-1">
            ชมรมถ่ายภาพราชินีบน
          </span>
          <h1 className="text-3xl font-serif font-medium text-white tracking-normal leading-tight">
            ยินดีต้อนรับสู่โลกแห่งภาพถ่าย
          </h1>
          <p className="text-xs text-purple-200/90 font-sans mt-2">
            บันทึกความทรงจำ พัฒนามุมมอง และเติบโตไปด้วยกันใน THE FLASH CLUB
          </p>
        </div>

        {/* Collage Card 5: Bottom Left Taking Photo */}
        <div className="absolute bottom-8 left-2 w-38 h-40 rounded-xl overflow-hidden shadow-2xl border-4 border-black/80 transform -rotate-8 z-20">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0p1CMhk2ZCP8SDqMEvZXqvLeXxu_RNWvVa3GaLllPv0RBfAmH4RLkp4tJjtJtsb3gBXEbSzzRgPisusYn2JpzhsO3iPmFgMtirMv9-3G0me2IrAoWY6bCSnhDE0xv_oRVcSjGiUOm1gkXyoGzePPjDfwCixZxOvD6rV73HJmSUY7YU7JNwodVcQ2Bw911vLyEtP8ETVy31iSkz94UDO-Bs54p4JQpwAGBqTE0E9GcBBhb25_T-cO7"
            alt="Taking camera shot"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Collage Card 6: Bottom Right Sunset Friends */}
        <div className="absolute bottom-6 right-2 w-36 h-36 rounded-xl overflow-hidden shadow-2xl border-4 border-black/80 transform rotate-6 z-20">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBmVvjeglcbBMIjhaVTTqONiajElji7Lu92F6X2nGFHVc2kYdFJZzpzuPWGQYThptoAY9YrZXRTfGoDjPQTJX5wnAKICXvewrArWI_kgpGhbfH4OzfpSgWTR-_nEJSDrvNySE0lytIfwc-nyxysmCliSxBwI4-428qxSEdNp4xYY3pyklaOvwvcDdOidGG7ZIKFqbkaChKZnTo19n8F-DBeRuwyaaM7z38aKftNQv9ug3jE3yUEggXp"
            alt="Friends laughing"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="w-full max-w-sm mx-auto z-30 pb-4 pt-2">
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl bg-[#cfc3e8] hover:bg-[#d8ceee] text-[#131b3e] font-serif font-bold text-lg tracking-wide shadow-2xl hover:shadow-purple-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <span>เริ่มต้นการเดินทาง</span>
          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};
