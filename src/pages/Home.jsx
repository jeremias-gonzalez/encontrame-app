import React, { useState, useEffect } from 'react';
import { BrandLogo } from '../components/Common/BrandLogo';

export function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nfc-pets-theme') || 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('nfc-pets-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('nfc-pets-theme', newTheme);
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="antialiased flex flex-col min-h-screen">
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 bg-surface shadow-md transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo Oficial Adaptativo */}
          <a href="#" className="flex items-center gap-2">
            <BrandLogo className="h-8 w-auto" />
          </a>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-6 font-semibold">
            <a href="#como-funciona" className="hover:text-primary transition-colors">¿Cómo funciona?</a>
            <a href="#producto" className="hover:text-primary transition-colors">El Producto</a>
            <a href="#testimonios" className="hover:text-primary transition-colors">Testimonios</a>
            
            {/* Selector de Temas */}
            <select 
              value={theme}
              onChange={(e) => changeTheme(e.target.value)}
              className="bg-background text-text border border-textMuted rounded-md px-2 py-1 outline-none focus:border-primary cursor-pointer transition-colors"
            >
              <option value="light">☀️ Claro</option>
              <option value="dark">🌙 Oscuro</option>
              <option value="nature">🌿 Naturaleza</option>
              <option value="ocean">🌊 Océano</option>
            </select>
          </nav>

          {/* Botón Menú Móvil */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-text focus:outline-none p-2 cursor-pointer" 
            aria-label="Abrir menú"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Menú Móvil Desplegable */}
        {isMenuOpen && (
          <div className="md:hidden bg-surface border-t border-background px-4 py-4 space-y-4 shadow-lg absolute w-full z-40">
            <a href="#como-funciona" onClick={closeMenu} className="block font-semibold hover:text-primary transition-colors">¿Cómo funciona?</a>
            <a href="#producto" onClick={closeMenu} className="block font-semibold hover:text-primary transition-colors">El Producto</a>
            <a href="#testimonios" onClick={closeMenu} className="block font-semibold hover:text-primary transition-colors">Testimonios</a>
            <div className="pt-2">
              <label htmlFor="theme-selector-mobile" className="block text-sm text-textMuted mb-1">Elegir tema:</label>
              <select 
                id="theme-selector-mobile"
                value={theme}
                onChange={(e) => changeTheme(e.target.value)}
                className="w-full bg-background text-text border border-textMuted rounded-md px-2 py-2 outline-none"
              >
                <option value="light">☀️ Claro</option>
                <option value="dark">🌙 Oscuro</option>
                <option value="nature">🌿 Naturaleza</option>
                <option value="ocean">🌊 Océano</option>
              </select>
            </div>
          </div>
        )}
      </header>

      {/* Contenido Principal */}
      <main className="flex-grow">
        {/* 2. Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 text-center md:text-left space-y-6">
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-[#92553A] dark:text-[#E3B48F]">
                Protege a tu mejor amigo con <span className="text-primary">Tecnología NFC</span>
              </h1>
              <p className="text-lg text-textMuted">
                Llavero impreso en 3D ultrarresistente. Quien encuentre a tu mascota solo debe acercar su celular para ver tu información de contacto. Sin baterías, sin apps.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a href="https://wa.me/1234567890?text=Hola,%20quiero%20comprar%20el%20llavero%20NFC%20para%20mi%20mascota" 
                   target="_blank" rel="noopener noreferrer"
                   className="bg-[#8D4925] hover:bg-[#5E2F17] text-[#FBF7F1] font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all inline-flex justify-center items-center gap-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824z"/></svg>
                    Comprar Ahora
                </a>
              </div>
            </div>
            <div className="flex-1 flex justify-center">
              <img src="https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80" alt="Llavero 3D con NFC para mascotas" className="w-full max-w-md rounded-2xl shadow-2xl transition-transform hover:-translate-y-2 object-cover h-80" />
            </div>
          </div>
        </section>

        {/* 3. ¿Cómo funciona? */}
        <section id="como-funciona" className="py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">¿Cómo funciona la tecnología NFC?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-background shadow-md transition-transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                <h3 className="text-xl font-bold mb-2">Impresión 3D</h3>
                <p className="text-textMuted">Fabricamos tu llavero con material 3D de alta durabilidad, diseñado para soportar la vida activa de tu mascota.</p>
              </div>
              <div className="p-6 rounded-2xl bg-background shadow-md transition-transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                <h3 className="text-xl font-bold mb-2">Acerca el Celular</h3>
                <p className="text-textMuted">Si alguien encuentra a tu mascota, solo debe acercar su teléfono al llavero. El chip NFC no necesita batería.</p>
              </div>
              <div className="p-6 rounded-2xl bg-background shadow-md transition-transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                <h3 className="text-xl font-bold mb-2">Contáctate</h3>
                <p className="text-textMuted">En la pantalla aparecerá el nombre de tu mascota y tu número de teléfono para que te llamen al instante.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Detalle del Producto */}
        <section id="producto" className="py-20">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Detalles del Llavero</h2>
            <div className="bg-surface rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row transition-transform hover:shadow-2xl">
              <div className="md:w-1/2">
                <img src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80" alt="Detalle del diseño del Llavero 3D NFC" className="w-full h-full object-cover min-h-[300px]" />
              </div>
              <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <span className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Edición Limitada</span>
                <h3 className="text-3xl font-bold mb-4">Llavero NFC SmartPet</h3>
                <p className="text-textMuted mb-6">
                  Hecho con PETG ecológico de alta resistencia. Resistente al agua, al barro y a las travesuras. Configurado con chip NTAG213/215 listo para usar.
                </p>
                <ul className="space-y-3 mb-8 text-sm text-text font-semibold">
                  <li className="flex items-center gap-2">✓ Resistente al agua (Waterproof)</li>
                  <li className="flex items-center gap-2">✓ No requiere suscripciones ni baterías</li>
                  <li className="flex items-center gap-2">✓ Compatible con cualquier smartphone iOS y Android</li>
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">$14.99</span>
                  <a href="https://wa.me/1234567890?text=Hola,%20quiero%20el%20Llavero%20SmartPet" target="_blank" rel="noopener noreferrer" className="bg-primary hover:bg-primaryHover text-white px-6 py-2 rounded-full font-bold shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                    Encargar
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Testimonios */}
        <section id="testimonios" className="py-20 bg-surface">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">Dueños Tranquilos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="p-8 bg-background rounded-3xl shadow-sm text-left">
                <p className="text-textMuted mb-4">"Mi perro se escapó hace unas semanas. Por suerte, un vecino lo encontró, escaneó el llavero y me llamó enseguida. El material 3D está intacto a pesar de que muerde todo."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">M</div>
                  <div>
                    <h4 className="font-bold">Martín G.</h4>
                    <span className="text-sm text-textMuted">Dueño de 'Toby'</span>
                  </div>
                </div>
              </div>
              <div className="p-8 bg-background rounded-3xl shadow-sm text-left">
                <p className="text-textMuted mb-4">"Es súper práctico. Odio esos collares pesados de metal que suenan todo el tiempo. Este es ligero, no hace ruido y la tecnología NFC funciona a la primera."</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold">L</div>
                  <div>
                    <h4 className="font-bold">Lucía R.</h4>
                    <span className="text-sm text-textMuted">Dueña de 'Luna'</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="bg-background py-8 border-t border-surface">
        <div className="max-w-6xl mx-auto px-4 text-center flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-textMuted font-semibold">&copy; 2026 Encontrame. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <a href="#" className="text-textMuted hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="text-textMuted hover:text-primary transition-colors">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;

