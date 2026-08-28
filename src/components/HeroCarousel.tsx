import { useEffect, useState } from 'react';

const FOTOS = ['/fotos/sismo-4.jpg', '/fotos/sismo-2.jpg', '/fotos/sismo-1.jpg', '/fotos/sismo-5.jpg', '/fotos/sismo-3.jpg'];

export function HeroCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % FOTOS.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {FOTOS.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1500ms] ease-in-out"
          style={{ opacity: i === active ? 1 : 0 }}
        />
      ))}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(155deg, rgba(27,53,86,0.92) 0%, rgba(16,35,61,0.88) 55%, rgba(16,35,61,0.75) 100%)' }}
      />
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2 sm:bottom-8">
        {FOTOS.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Foto ${i + 1}`}
            onClick={() => setActive(i)}
            className="h-1.5 rounded-full transition-all"
            style={{ width: i === active ? 24 : 8, background: i === active ? '#F5A623' : 'rgba(255,255,255,0.4)' }}
          />
        ))}
      </div>
    </div>
  );
}
