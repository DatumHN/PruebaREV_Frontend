import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, FileText } from 'lucide-angular';

@Component({
  selector: 'app-registry-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="card-custom-new" [routerLink]="routerLink()">
      <div class="card-custom-body-new">
        <lucide-angular
          [img]="icon()"
          [size]="40"
          color="#667eea"
          class="icon-custom-new"
        ></lucide-angular>
        <h6 class="card-custom-title-new">
          {{ title() }}
        </h6>
      </div>
    </div>
  `,
  styles: [
    `
      .card-custom-new {
        flex: 1 1 180px; /* Reducido para que quepan 5 por fila */
        min-width: 150px; /* Mínimo más pequeño para compresión en hover */
        transition: all 0.4s ease-in-out;
        background: linear-gradient(145deg, #ffffff, #f0f4f8);
        border: none;
        border-radius: 15px;
        cursor: pointer;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
        position: relative;
        overflow: hidden;
        height: 140px;
        display: flex;
        align-items: center;
        justify-content: center;
        background-size: 200% 100%;
        background-position: left center;
        animation: slideInUp 0.6s ease-out both;
        z-index: 1;
      }

      .card-custom-new:hover {
        flex-grow: 6 !important;
        flex-shrink: 0 !important; /* No se encoge la card en hover */
        min-width: 320px !important; /* Ancho mínimo en hover */
        max-width: none !important; /* Quitar limitación en hover */
        background-image: linear-gradient(
          to right,
          #2112c9 0%,
          #687eff 51%,
          #050e5b 100%
        );
        background-position: right center;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        z-index: 5;
      }

      /* Las cards hermanas se comprimen cuando una está en hover */
      .card-custom-new:not(:hover) {
        flex-shrink: 3 !important; /* Se encogen más cuando hay hover en hermanas */
        min-width: 160px !important; /* Forzar compresión al mínimo */
      }

      .card-custom-new:hover .card-custom-body-new {
        color: #fff;
      }

      .card-custom-new:hover .icon-custom-new {
        color: white !important;
        font-size: 3.5rem !important; /* Más grande para efecto más visible */
        transform: translateY(-8px) scale(1.2); /* Más transformación */
      }

      /* Fuerza el color blanco en el SVG del icono */
      .card-custom-new:hover .icon-custom-new svg {
        color: white !important;
        fill: white !important;
        stroke: white !important;
      }

      .card-custom-new:hover .card-custom-title-new {
        color: white;
        font-size: 1.1rem !important; /* Más grande en hover */
        font-weight: 700;
        transform: translateY(-3px); /* Ligero movimiento */
      }

      .card-custom-body-new {
        text-align: center;
        padding: 15px 10px;
        position: relative;
        z-index: 2;
        transition: all 0.3s ease;
        color: #2c3e50;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
      }

      .icon-custom-new {
        margin-bottom: 15px;
        transition: all 0.3s ease;
        display: block;
        margin-left: auto;
        margin-right: auto;
      }

      .card-custom-title-new {
        font-size: 0.9rem;
        font-weight: 600;
        line-height: 1.3;
        margin: 0;
        display: block;
        text-align: center;
        min-height: 40px;
        max-height: 60px;
        overflow: hidden;
        word-wrap: break-word;
        hyphens: auto;
        padding: 0 8px;
        transition: all 0.3s ease;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
      }

      @keyframes slideInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @media (max-width: 768px) {
        .card-custom-new {
          height: 120px;
          flex: 1 1 100%;
          max-width: 100%;
          min-width: 100%;
        }

        .card-custom-new:hover {
          transform: scale(1.02);
          flex-grow: 1 !important; /* En móvil no expandir */
          max-width: 100% !important;
        }

        .icon-custom-new {
          font-size: 2rem;
        }

        .card-custom-title-new {
          font-size: 0.8rem;
          max-height: 50px;
        }
      }

      /* Tablets - permitir crecimiento en hover */
      @media (min-width: 769px) and (max-width: 1024px) {
        .card-custom-new {
          flex: 1 1 160px;
          min-width: 140px;
        }

        .card-custom-new:hover {
          flex-grow: 5 !important;
          min-width: 280px !important;
        }
      }

      /* Desktop - 5 cards por fila sin restricciones */
      @media (min-width: 1025px) {
        .card-custom-new {
          flex: 1 1 180px; /* Base para 5 cards */
          min-width: 160px; /* Mínimo para compresión */
          /* No max-width para permitir expansión en hover */
        }

        .card-custom-new:hover {
          flex-grow: 6 !important;
          min-width: 320px !important;
        }

        /* Cuando hay hover, las otras cards se comprimen */
        .card-custom-new:not(:hover) {
          flex-shrink: 3 !important;
        }
      }
    `,
  ],
})
export class RegistryCardComponent {
  icon = input.required<typeof FileText>();
  title = input.required<string>();
  routerLink = input.required<string | (string | number)[]>();
}
