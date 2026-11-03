import React from 'react';

/**
 * Componente oficial BrandLogo para Encontrame.
 * Adapta automáticamente la versión del logotipo de la carpeta /public
 * para garantizar contraste perfecto:
 * - Modo Claro: encontrame_logo_cobre.svg (letras cobrizo #8D4925, huella crema #F3E6CF)
 * - Modo Oscuro: encontrame_logo_crema.svg (letras crema #F3E6CF, huella cobrizo #8D4925)
 */
export function BrandLogo({
  className = 'h-7 w-auto',
  theme = 'auto',
  
}) {
  return (
    <div className="inline-flex items-center gap-2 select-none">
      {theme === 'light' ? (
        <img
          src="/encontrame_logo_cobre.svg"
          alt="Encontrame"
          className={className}
        />
      ) : theme === 'dark' ? (
        <img
          src="/encontrame_logo_crema.svg"
          alt="Encontrame"
          className={className}
        />
      ) : (
        <>
          {/* Versión Cobrizo para Modo Claro */}
          <img
            src="/encontrame_logo_cobre.svg"
            alt="Encontrame"
            className={`${className} logo-light`}
          />
          {/* Versión Crema para Modo Oscuro */}
          <img
            src="/encontrame_logo_crema.svg"
            alt="Encontrame"
            className={`${className} logo-dark`}
          />
        </>
      )}

    </div>
  );
}

export default BrandLogo;

