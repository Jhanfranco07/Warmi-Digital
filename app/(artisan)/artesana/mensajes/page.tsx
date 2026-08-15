import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { ArrowLeft, Info, Search, Send, SlidersHorizontal } from "lucide-react";

import { MessageComposer } from "@/features/artisan/message-composer";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { requireRole } from "@/shared/server/auth/helpers";

type PageProps = {
  searchParams?: Promise<{ conversation?: string }>;
};

export default async function ArtisanMessagesPage({ searchParams }: PageProps) {
  const session = await requireRole("ARTESANA");
  const params = await searchParams;
  const repository = new ConversationRepository();
  const conversations = await repository.findForUser(session.user.id);
  const selectedId = params?.conversation ?? conversations[0]?.id ?? null;
  const selected = selectedId
    ? await repository.findAuthorizedConversation(selectedId, session.user.id)
    : null;

  return (
    <>
      <section className="relative overflow-hidden bg-[#fffaf6] px-5 pb-28 pt-6 lg:hidden">
        <MobileDecor />
        <div className="relative">
          <h1 className="font-serif text-5xl font-bold leading-tight text-[#7a1042]">
            Mensajes <span className="text-[#ef9baa]">-</span>
          </h1>

          <div className="mt-6 flex min-h-16 items-center gap-4 rounded-full border border-[#f0c3cf] bg-white px-5 shadow-[0_14px_30px_rgba(181,36,91,0.08)]">
            <Search className="h-7 w-7 text-[#b5245b]" />
            <span className="text-lg text-[#8d7a72]">Buscar conversaciones...</span>
          </div>

          <div className="mt-6 flex items-center gap-8 border-b border-[#f5d2dc] text-lg">
            <span className="border-b-2 border-[#b5245b] pb-3 font-bold text-[#7a1042]">
              Todas
            </span>
            <span className="pb-3 text-[#8d7a72]">No leidas</span>
            <span className="pb-3 text-[#8d7a72]">Grupos</span>
          </div>

          <ConversationList
            conversations={conversations}
            selectedId={selected?.id ?? null}
            currentUserId={session.user.id}
            mobile
          />
        </div>

        {selected ? (
          <MobileConversation conversation={selected} currentUserId={session.user.id} />
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No hay conversaciones todavia"
              description="Tus mensajes con facilitadoras, comunidad y equipo Warmi apareceran aqui."
            />
          </div>
        )}
      </section>

      <main className="hidden min-h-screen bg-[#fffaf6] px-4 py-5 pb-24 md:px-8 lg:block lg:px-10 lg:py-10 xl:px-14 2xl:px-20">
        <div className="mx-auto w-full max-w-[1760px]">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl font-bold leading-none text-[#101833] md:text-6xl 2xl:text-7xl">
                Mensajes <span className="text-4xl text-[#b5245b]">-</span>
              </h1>
              <p className="mt-4 max-w-4xl text-lg leading-8 text-[#5b4a42]">
                Conversa con facilitadoras y comunidad desde tus conversaciones reales.
              </p>
            </div>
          </header>

          <section className="mt-8 grid gap-8 xl:grid-cols-[0.7fr_1.3fr]">
            <aside className="overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
              <div className="grid gap-4 border-b border-[#ecd0bd] p-5 md:grid-cols-[1fr_56px]">
                <div className="flex min-h-14 items-center gap-3 rounded-lg border border-[#ecd0bd] bg-white px-4 text-[#7a5b4a]">
                  <Search className="h-5 w-5" />
                  Buscar conversaciones
                </div>
                <button
                  type="button"
                  className="grid h-14 place-items-center rounded-lg border border-[#ecd0bd] text-[#7a3100]"
                  aria-label="Filtrar conversaciones"
                >
                  <SlidersHorizontal className="h-6 w-6" />
                </button>
              </div>

              <ConversationList
                conversations={conversations}
                selectedId={selected?.id ?? null}
                currentUserId={session.user.id}
              />
            </aside>

            {selected ? (
              <ConversationPanel
                conversation={selected}
                currentUserId={session.user.id}
              />
            ) : (
              <section className="rounded-[20px] border border-[#ecd0bd] bg-white p-8 shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
                <EmptyState
                  title="No hay conversaciones todavia"
                  description="Cuando una facilitadora o el equipo Warmi te escriba, el chat aparecera aqui."
                />
              </section>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

type ConversationListProps = {
  conversations: Awaited<ReturnType<ConversationRepository["findForUser"]>>;
  selectedId: string | null;
  currentUserId: string;
  mobile?: boolean;
};

function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  mobile = false
}: ConversationListProps) {
  if (!conversations.length) {
    return (
      <div className={mobile ? "mt-4" : "p-5"}>
        <p className="rounded-2xl border border-dashed border-[#f0c3cf] bg-white p-5 text-sm text-[#7a5b4a]">
          Aun no tienes conversaciones.
        </p>
      </div>
    );
  }

  return (
    <div className={mobile ? "mt-4 space-y-1" : undefined}>
      {conversations.map((conversation) => {
        const other = conversation.participants.find(
          (participant) => participant.userId !== currentUserId
        )?.user;
        const currentParticipant = conversation.participants.find(
          (participant) => participant.userId === currentUserId
        );
        const lastMessage = conversation.messages[0];
        const unread =
          lastMessage &&
          lastMessage.senderId !== currentUserId &&
          (!currentParticipant?.lastReadAt ||
            lastMessage.createdAt > currentParticipant.lastReadAt);
        const title =
          conversation.title ??
          other?.profile?.displayName ??
          other?.name ??
          other?.email ??
          "Conversacion";

        return (
          <Link
            key={conversation.id}
            href={`/artesana/mensajes?conversation=${conversation.id}`}
            className={`flex items-center gap-4 border-[#f1ddcf] p-5 transition-colors duration-300 hover:bg-[#fff5ed] ${
              mobile
                ? `rounded-3xl border ${selectedId === conversation.id ? "bg-[#fff1f5]" : "border-transparent"}`
                : `border-b ${selectedId === conversation.id ? "bg-[#fff8f1]" : "bg-white"}`
            }`}
          >
            <Avatar
              image={other?.profile?.avatarUrl ?? other?.image ?? null}
              name={title}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="truncate font-ui text-lg font-extrabold text-[#1b1c1a]">
                  {title}
                </h2>
                <span className="text-sm text-[#7a5b4a]">
                  {formatConversationDate(
                    lastMessage?.createdAt ?? conversation.updatedAt
                  )}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-[#5b4a42]">
                {lastMessage?.content ?? "Sin mensajes todavia."}
              </p>
            </div>
            {unread ? (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#b5245b] text-xs font-bold text-white">
                1
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

type ConversationDetail = NonNullable<
  Awaited<ReturnType<ConversationRepository["findAuthorizedConversation"]>>
>;

function ConversationPanel({
  conversation,
  currentUserId
}: {
  conversation: ConversationDetail;
  currentUserId: string;
}) {
  const other = conversation.participants.find(
    (participant) => participant.userId !== currentUserId
  )?.user;
  const title =
    conversation.title ??
    other?.profile?.displayName ??
    other?.name ??
    other?.email ??
    "Conversacion";

  return (
    <section className="flex min-h-[760px] flex-col overflow-hidden rounded-[20px] border border-[#ecd0bd] bg-white shadow-[0_22px_58px_rgba(122,49,0,0.08)]">
      <header className="flex items-center justify-between border-b border-[#ecd0bd] p-6">
        <div className="flex items-center gap-4">
          <Avatar
            image={other?.profile?.avatarUrl ?? other?.image ?? null}
            name={title}
          />
          <div>
            <h2 className="font-ui text-xl font-extrabold text-[#1b1c1a]">{title}</h2>
            <p className="text-sm text-[#5b4a42]">Conversacion Warmi Digital</p>
          </div>
        </div>
        <Info className="h-6 w-6 text-[#7a3100]" />
      </header>

      <div className="relative flex-1 space-y-6 overflow-y-auto p-6">
        {conversation.messages.length ? (
          conversation.messages.map((message) => (
            <MessageBubble
              key={message.id}
              align={message.senderId === currentUserId ? "right" : "left"}
              time={format(message.createdAt, "HH:mm", { locale: es })}
            >
              {message.content}
            </MessageBubble>
          ))
        ) : (
          <EmptyState title="Esta conversacion aun no tiene mensajes" />
        )}
      </div>

      <footer className="border-t border-[#ecd0bd] p-5">
        <MessageComposer conversationId={conversation.id} />
      </footer>
    </section>
  );
}

function MobileConversation({
  conversation,
  currentUserId
}: {
  conversation: ConversationDetail;
  currentUserId: string;
}) {
  return (
    <section
      id="chat-warmi"
      className="relative mt-8 scroll-mt-24 overflow-hidden rounded-t-[28px] border-t border-[#f5cbd5] bg-white/75 pt-4"
    >
      <header className="flex items-center gap-4 border-b border-[#f5d2dc] px-1 pb-4">
        <Link
          href="/artesana/mensajes"
          aria-label="Volver a mensajes"
          className="grid h-11 w-11 place-items-center rounded-full text-[#7a1042]"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-ui text-xl font-extrabold text-[#1b1c1a]">
            {conversation.title ?? "Conversacion"}
          </h2>
          <p className="text-sm font-bold text-[#2f9b62]">Activa</p>
        </div>
        <Info className="h-7 w-7 text-[#7a1042]" />
      </header>

      <div className="space-y-5 px-1 py-5">
        {conversation.messages.map((message) => (
          <MessageBubble
            key={message.id}
            align={message.senderId === currentUserId ? "right" : "left"}
            time={format(message.createdAt, "HH:mm", { locale: es })}
          >
            {message.content}
          </MessageBubble>
        ))}
      </div>
      <MessageComposer conversationId={conversation.id} />
    </section>
  );
}

function Avatar({ image, name }: { image: string | null; name: string }) {
  return (
    <span className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#fff1e5] text-[#b5245b]">
      {image ? (
        <Image src={image} alt={name} fill sizes="64px" className="object-cover" />
      ) : (
        <Send className="h-6 w-6" />
      )}
    </span>
  );
}

function MessageBubble({
  align,
  time,
  children
}: {
  align: "left" | "right";
  time: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative flex ${align === "right" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[680px] rounded-xl border px-5 py-4 shadow-[0_12px_28px_rgba(122,49,0,0.06)] ${
          align === "right"
            ? "border-[#f4c6d8] bg-[#ffdce8] text-[#1b1c1a]"
            : "border-[#ecd0bd] bg-white text-[#1b1c1a]"
        }`}
      >
        <p className="text-base leading-7">{children}</p>
        <p className="mt-2 text-right text-xs text-[#7a5b4a]">{time}</p>
      </div>
    </div>
  );
}

function MobileDecor() {
  return (
    <>
      <div className="pointer-events-none absolute -right-20 top-28 h-56 w-56 rounded-full bg-[#ffe6ee]" />
      <div className="pointer-events-none absolute -right-8 top-32 h-44 w-44 opacity-70">
        <Image
          src="/images/brand/warmi-isotipo.png"
          alt=""
          fill
          sizes="176px"
          className="object-contain"
        />
      </div>
    </>
  );
}

function formatConversationDate(date: Date) {
  return format(date, "dd MMM", { locale: es });
}
