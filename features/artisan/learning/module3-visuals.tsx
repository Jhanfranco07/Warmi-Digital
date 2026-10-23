/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages -- Offline assets and routes are handled by the local shell. */
import type { ReactNode, RefObject } from "react";
import { MODULE3_SESSIONS } from "@/shared/learning/module3-journey";
import { MODULE3_ILLUSTRATIONS } from "@/shared/learning/module3-illustrations";
import {
  Camera,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileCheck2,
  ImageIcon,
  List,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  Smartphone,
  Store,
  Truck,
  Users,
  Wallet,
  type LucideIcon
} from "lucide-react";

export const module3AudioStyle = "rounded-lg bg-[#f0ede9] p-3";
export const module3GuideStyle =
  "space-y-3 rounded-lg border border-[#ddbfc6] border-t-4 border-t-[#006b5a] bg-white p-4 shadow-sm";

export function Module3SessionHeader({
  href,
  session,
  title,
  active,
  total,
  mode,
  open,
  onOpen,
  selectorRef,
  closing = false,
  offline = false
}: {
  href: string;
  session: number;
  title: string;
  active: number;
  total: number;
  mode: "Temas" | "Pasos";
  open: boolean;
  onOpen: () => void;
  selectorRef?: RefObject<HTMLButtonElement | null>;
  closing?: boolean;
  offline?: boolean;
}) {
  return (
    <header className="space-y-3 border-b border-[#ddbfc6] pb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <a
          href={href}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#800041]"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5 shrink-0" /> Volver al módulo 3
        </a>
        {offline && (
          <span
            data-mode-detail
            aria-label="Disponible sin conexión"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#006b5a]"
          >
            <CheckCircle2 aria-hidden="true" className="h-4 w-4 shrink-0" /> Descargado
          </span>
        )}
      </div>
      {!closing && (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#006b5a]">
              Módulo 3 · Sesión {session}
            </p>
            <button
              ref={selectorRef}
              onClick={onOpen}
              aria-haspopup="dialog"
              aria-expanded={open}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md bg-[#f0ede9] px-3 text-sm font-bold text-[#800041]"
            >
              <List aria-hidden="true" className="h-4 w-4" /> {mode}
              <ChevronDown aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <h1 className="font-serif text-xl font-bold leading-tight text-[#1c1c19]">
            {title}
          </h1>
          <nav
            aria-label="Sesiones del Módulo 3"
            className="flex flex-wrap items-center gap-2"
          >
            <span className="mr-1 text-xs font-bold text-[#006b5a]">Sesiones</span>
            {MODULE3_SESSIONS.map((item) => (
              <a
                key={item.id}
                href={`${new URL(href, "https://warmi.invalid").pathname}/lecciones/${item.id}`}
                aria-current={item.order === session ? "step" : undefined}
                aria-label={`Sesión ${item.order}: ${item.title}`}
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#ddbfc6] text-sm font-bold text-[#800041] aria-[current=step]:bg-[#800041] aria-[current=step]:text-white"
              >
                {item.order}
              </a>
            ))}
          </nav>
          <p role="status" className="text-xs font-bold text-[#006b5a]">
            {mode === "Temas" ? "Tema activo:" : "Paso"} {active + 1} de {total}
          </p>
          <div
            aria-hidden="true"
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: total }, (_, index) => (
              <span
                key={index}
                className={`h-1.5 rounded-full ${index === active ? "bg-[#006b5a]" : "bg-[#e5e2dd]"}`}
              />
            ))}
          </div>
        </>
      )}
    </header>
  );
}

export function LearningTip({
  children,
  title = "Para recordar",
  strong = false
}: {
  children: ReactNode;
  title?: string;
  strong?: boolean;
}) {
  return (
    <aside
      className={`rounded-lg p-5 ${strong ? "bg-[#800041] text-white" : "border-l-4 border-[#006b5a] bg-[#e2f2ec] text-[#005143]"}`}
    >
      <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase">
        <ShieldCheck aria-hidden="true" className="h-5 w-5 shrink-0" /> {title}
      </p>
      <div className="font-semibold leading-7">{children}</div>
    </aside>
  );
}

export function LearningPhoto({
  kind,
  caption
}: {
  kind: "payment" | "packing" | "support" | "together" | "community";
  caption: string;
}) {
  const photos = {
    payment: MODULE3_ILLUSTRATIONS.payment,
    packing: MODULE3_ILLUSTRATIONS.packing,
    support: MODULE3_ILLUSTRATIONS.support,
    together: {
      src: "/images/offline/taller.webp",
      alt: "Artesana aprendiendo con una facilitadora de Warmi"
    },
    community: {
      src: "/images/offline/aprende.webp",
      alt: "Grupo de artesanas practicando con sus celulares alrededor de una mesa"
    }
  } as const;
  const { src, alt } = photos[kind];
  const illustration = kind === "payment" || kind === "packing" || kind === "support";
  return (
    <figure className="overflow-hidden rounded-lg bg-[#f0ede9]">
      <img
        src={src}
        alt={alt}
        width={illustration ? 960 : 440}
        height={illustration ? 640 : 330}
        className="aspect-[3/2] max-h-80 w-full object-contain"
      />
      <figcaption className="px-4 py-3 text-sm font-semibold text-[#005143]">
        {caption}
        {illustration && (
          <span className="mt-1 block text-xs font-normal">Ilustración educativa</span>
        )}
      </figcaption>
    </figure>
  );
}

export function IconSequence({
  items
}: {
  items: readonly { title: string; detail?: string; icon: LucideIcon }[];
}) {
  return (
    <ol className="ml-5 space-y-4 border-l-2 border-[#9dd9c8] pl-7">
      {items.map(({ title, detail, icon: Icon }, index) => (
        <li key={title} className="relative min-h-14 py-1">
          <span className="absolute -left-12 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#006b5a] text-white">
            <Icon aria-hidden="true" className="h-5 w-5" />
          </span>
          <p className="text-xs font-bold text-[#006b5a]">{index + 1}</p>
          <h3 className="font-bold text-[#1c1c19]">{title}</h3>
          {detail && <p className="mt-1 text-sm text-[#574147]">{detail}</p>}
        </li>
      ))}
    </ol>
  );
}

export function ProductExample({
  mode = "catalog"
}: {
  mode?: "catalog" | "market" | "store";
}) {
  const image =
    mode === "store"
      ? {
          src: "/images/learning/module4/tejidos.webp",
          alt: "Tejidos artesanales doblados, ejemplo de vitrina digital"
        }
      : MODULE3_ILLUSTRATIONS[mode];
  const title =
    mode === "catalog"
      ? "Bolso tejido a mano"
      : mode === "market"
        ? "Jarrón artesanal"
        : "Tejidos de mi comunidad";
  return (
    <figure className="overflow-hidden rounded-lg border border-[#ddbfc6] bg-white shadow-sm">
      <figcaption className="flex items-center gap-2 bg-[#006b5a] px-4 py-3 text-sm font-bold text-white">
        <Store aria-hidden="true" className="h-5 w-5" />
        {mode === "catalog"
          ? "Mi catálogo"
          : mode === "market"
            ? "Mi publicación"
            : "Mi vitrina digital"}
        <span className="ml-auto text-xs font-normal">Ejemplo educativo</span>
      </figcaption>
      <img
        src={image.src}
        width={mode === "store" ? 400 : 960}
        height={mode === "store" ? 267 : 640}
        alt={image.alt}
        className="aspect-[3/2] max-h-80 w-full bg-white object-contain"
      />
      <div className="space-y-3 p-4">
        <h3 className="font-serif text-xl font-bold text-[#1c1c19]">{title}</h3>
        <p className="text-sm">
          Una pieza de mi comunidad. Describo sus materiales, medidas y técnica.
        </p>
        <dl className="grid grid-cols-2 gap-3 border-t border-[#ead2dc] pt-3 text-sm">
          <div>
            <dt className="font-bold text-[#006b5a]">Precio</dt>
            <dd>Indico el de mi pieza</dd>
          </div>
          <div>
            <dt className="font-bold text-[#006b5a]">Disponibilidad</dt>
            <dd>La reviso antes de publicar</dd>
          </div>
        </dl>
        {mode !== "store" && (
          <p className="text-xs text-[#574147]">
            Ilustración educativa; no es un producto en venta.
          </p>
        )}
      </div>
    </figure>
  );
}

export function PracticeChat({ message }: { message: string }) {
  return (
    <figure className="overflow-hidden rounded-lg border border-[#9dd9c8] bg-[#eaf3ed]">
      <figcaption className="flex items-center gap-2 border-b border-[#9dd9c8] bg-white p-4 text-sm font-bold text-[#006b5a]">
        <MessageCircle aria-hidden="true" className="h-5 w-5 shrink-0" />
        Simulación de mensaje · no se envía
      </figcaption>
      <div className="p-4 sm:p-6">
        <p className="mb-2 text-xs font-bold text-[#005143]">Yo, como artesana</p>
        <blockquote className="ml-4 rounded-lg rounded-tr-none border border-[#9dd9c8] bg-[#d8f4e8] p-4 text-[#1c1c19] shadow-sm">
          {message}
        </blockquote>
      </div>
    </figure>
  );
}

export function ReceiptExample() {
  return (
    <figure className="rounded-lg border border-dashed border-[#a09096] bg-white p-5 shadow-sm">
      <figcaption className="border-b border-[#ddbfc6] pb-3 text-center text-xs font-bold text-[#800041]">
        EJEMPLO EDUCATIVO · SIN VALIDEZ
      </figcaption>
      <div className="my-4 flex items-center gap-3">
        <FileCheck2 aria-hidden="true" className="h-8 w-8 shrink-0 text-[#006b5a]" />
        <p className="font-serif text-xl font-bold text-[#1c1c19]">
          Respaldo de mi envío
        </p>
      </div>
      <ul className="divide-y divide-[#ead2dc] text-sm">
        {[
          "Foto del paquete",
          "Comprobante de la agencia",
          "Datos para consultar el envío"
        ].map((item) => (
          <li key={item} className="py-3">
            {item}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-[#574147]">
        Esquema de práctica. No es un comprobante real.
      </p>
    </figure>
  );
}

export function Session1TopicVisual({ index }: { index: number }) {
  if (index === 0 || index === 6) {
    const compare =
      index === 0
        ? [
            {
              title: "WhatsApp personal",
              icon: MessageCircle,
              text: "Converso con familia, amistades y contactos.",
              detail: "Conversaciones cotidianas"
            },
            {
              title: "WhatsApp Business",
              icon: Store,
              text: "Presento mi emprendimiento y organizo mis productos.",
              detail: "Perfil de negocio y catálogo"
            }
          ]
        : [
            {
              title: "Estados de WhatsApp",
              icon: Smartphone,
              text: "Comparto novedades con mis contactos, según mi privacidad.",
              detail: "Reviso quién puede verlos"
            },
            {
              title: "Facebook",
              icon: Users,
              text: "Presento mi trabajo a otras personas, según la audiencia elegida.",
              detail: "Elijo dónde publicar"
            }
          ];
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {compare.map(({ title, icon: Icon, text, detail }, number) => (
          <article
            key={title}
            className={`space-y-3 rounded-lg border p-5 ${number ? "border-[#9dd9c8] bg-[#e2f2ec]" : "border-[#ddbfc6] bg-white"}`}
          >
            <Icon
              aria-hidden="true"
              className={`h-9 w-9 ${number ? "text-[#006b5a]" : "text-[#800041]"}`}
            />
            <h3 className="font-serif text-xl font-bold text-[#1c1c19]">{title}</h3>
            <p className="text-sm">{text}</p>
            <p className="border-current/15 border-t pt-3 text-sm font-bold text-[#006b5a]">
              {detail}
            </p>
          </article>
        ))}
      </div>
    );
  }
  if (index === 1)
    return (
      <figure className="overflow-hidden rounded-lg border border-[#9dd9c8] bg-white">
        <figcaption className="bg-[#006b5a] p-4 text-sm font-bold text-white">
          Perfil de negocio · ejemplo educativo
        </figcaption>
        <div className="flex items-center gap-4 p-5">
          <img
            src="/images/learning/module4/bolso.webp"
            alt="Bolso artesanal como ejemplo de foto de negocio"
            width={131}
            height={114}
            className="h-20 w-20 rounded-full border border-[#ddbfc6] object-contain"
          />
          <div>
            <h3 className="font-serif text-xl font-bold text-[#1c1c19]">
              Artesanías de mi comunidad
            </h3>
            <p className="text-sm text-[#006b5a]">Mi nombre y mi trabajo</p>
          </div>
        </div>
        <dl className="space-y-4 border-t border-[#ead2dc] p-5 text-sm">
          <div>
            <dt className="font-bold text-[#006b5a]">Descripción</dt>
            <dd>Explico qué elaboro y qué hace especial a mi artesanía.</dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 font-bold text-[#006b5a]">
              <Clock3 aria-hidden="true" className="h-4 w-4" />
              Horario
            </dt>
            <dd>Indico cuándo puedo atender consultas.</dd>
          </div>
        </dl>
      </figure>
    );
  if (index === 2 || index === 5)
    return <ProductExample mode={index === 2 ? "catalog" : "market"} />;
  if (index === 3)
    return (
      <figure className="overflow-hidden rounded-lg border border-[#ddbfc6] bg-[#213d35] text-white">
        <figcaption className="flex items-center gap-2 p-4 text-sm font-bold">
          <Smartphone aria-hidden="true" className="h-5 w-5" />
          Mi estado · ejemplo educativo
        </figcaption>
        <img
          src={MODULE3_ILLUSTRATIONS.status.src}
          alt={MODULE3_ILLUSTRATIONS.status.alt}
          width={960}
          height={640}
          className="aspect-[3/2] max-h-80 w-full object-contain"
        />
        <blockquote className="p-5 text-center font-serif text-xl">
          Hecho a mano en mi comunidad. Escríbeme para conocer mis piezas.
        </blockquote>
        <p className="border-t border-white/20 px-4 py-3 text-sm">
          Foto clara + frase breve + cómo consultarme · Ilustración educativa
        </p>
      </figure>
    );
  return (
    <LearningTip title="Mi cuenta, bajo mi cuidado">
      Uso mi número o correo y protejo mi contraseña. Los códigos de verificación no se
      comparten.
    </LearningTip>
  );
}

export const paymentIcons = [Smartphone, Search, Wallet, Package];
export const questionIcons = [FileCheck2, Wallet, Truck, Clock3];
export const platformIcons = [Store, Users, MessageCircle, Package];
export const platformTones = [
  "bg-[#006b5a] text-white",
  "bg-[#800041] text-white",
  "bg-[#365e96] text-white",
  "bg-[#f5cd50] text-[#1c1c19]"
];
export const deliverySequences = [
  [
    { title: "Lugar y fecha", icon: MapPin },
    { title: "Costo del envío", icon: Wallet },
    { title: "Acuerdo escrito", icon: MessageCircle }
  ],
  [
    { title: "Empaque limpio", icon: Package },
    { title: "Pieza protegida", icon: ShieldCheck },
    { title: "Sin humedad", icon: ShieldCheck },
    { title: "Identificación cuando corresponda", icon: FileCheck2 }
  ],
  [
    { title: "Fotografío el paquete", icon: Camera },
    { title: "Guardo el comprobante", icon: FileCheck2 },
    { title: "Conservo los datos de la agencia", icon: Truck }
  ],
  [
    { title: "Comparto el seguimiento si existe", icon: Truck },
    { title: "Aviso la fecha estimada", icon: Clock3 },
    { title: "Pregunto si llegó bien", icon: MessageCircle }
  ]
] as const;

export const storefrontBenefits = [
  {
    title: "Muestro mis piezas",
    detail: "Fotos y descripciones claras.",
    icon: ImageIcon
  },
  { title: "Llego a otras personas", detail: "Doy a conocer mi trabajo.", icon: Users },
  { title: "Comparo alternativas", detail: "Elijo dónde empezar.", icon: Store },
  {
    title: "Reviso las condiciones",
    detail: "Entiendo costos, pagos y entregas.",
    icon: ShieldCheck
  }
] as const;
