import Image from "next/image";

import { WarmiPublicHeader } from "@/app/(public)/_components/warmi-public-header";

const colors = ["#2f62a3", "#b5245b", "#17c3cf", "#f15a24", "#ff8941", "#f5b900"];

export default function LandingPage() {
  return (
    <main className="bg-white text-[#10124f]">
      <WarmiPublicHeader />

      <section className="mx-auto w-full max-w-[1760px] px-4 py-10 md:px-8 lg:px-12 lg:py-16">
        <div className="warmi-scroll-reveal grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <div className="flex gap-3">
              {colors.map((color) => (
                <span
                  key={color}
                  className="h-8 w-8 rounded-full md:h-10 md:w-10"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="mt-8 h-1 w-full max-w-[620px] bg-[#123f78]" />

            <h2 className="mt-10 max-w-4xl font-serif text-4xl font-bold uppercase leading-tight tracking-[0.06em] text-[#10124f] md:text-6xl">
              Sllapan wawqaykunaman allin hamuy
            </h2>

            <div className="mt-10 inline-flex bg-[#c02a68] px-8 py-5 md:px-14">
              <p className="font-ui text-2xl font-extrabold uppercase text-white md:text-3xl">
                Bienvenidos a Warmi
              </p>
            </div>
          </div>

          <div className="group relative min-h-[280px] overflow-hidden border border-[#ead4ca] bg-[#fffaf8] shadow-[0_18px_42px_rgba(122,49,0,0.08)] md:min-h-[420px]">
            <Image
              src="/images/home/bienvenida-warmi.png"
              alt="Artesanas Warmi"
              fill
              priority
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </div>

        <p className="warmi-scroll-reveal mx-auto mt-10 max-w-5xl text-center font-serif text-2xl font-bold italic leading-tight text-[#10124f] md:text-3xl">
          “La tecnologia no reemplaza la tradicion; la conecta con nuevas oportunidades.”
        </p>
      </section>
    </main>
  );
}
