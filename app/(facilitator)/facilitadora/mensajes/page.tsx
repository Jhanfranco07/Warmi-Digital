import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart3,
  BookOpen,
  Info,
  MessageCircle,
  Search,
  Send,
  SlidersHorizontal,
  UsersRound
} from "lucide-react";

import { ConversationReadMarker } from "@/features/facilitator/conversation-read-marker";
import { MessageComposer } from "@/features/facilitator/message-composer";
import { StartConversationForm } from "@/features/facilitator/start-conversation-form";
import { EmptyState } from "@/shared/components/feedback/empty-state";
import { MessageAutoRefresh } from "@/shared/components/messaging/message-auto-refresh";
import { ConversationRepository } from "@/shared/repositories/conversation.repository";
import { ArtisanMonitoringService } from "@/shared/services/facilitator.service";
import { requireRole } from "@/shared/server/auth/helpers";

type PageProps = {
  searchParams?: Promise<{ conversation?: string; filter?: string; q?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const session = await requireRole("FACILITADORA");
  const params = await searchParams;
  const repository = new ConversationRepository();
  const [conversations, artisans] = await Promise.all([
    repository.findForUser(session.user.id),
    new ArtisanMonitoringService().list(session.user.id)
  ]);

  const query = params?.q?.trim() ?? "";
  const showUnreadOnly = params?.filter === "unread";
  const filteredConversations = conversations
    .filter((conversation) =>
      showUnreadOnly
        ? hasUnreadConversation(conversation, session.user.id)
        : true
    )
    .filter((conversation) =>
      query
        ? getConversationTitle(conversation, session.user.id)
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (conversation.messages[0]?.content ?? "")
            .toLowerCase()
            .includes(query.toLowerCase())
        : true
    );

  const selectedId =
    params?.conversation ?? filteredConversations[0]?.id ?? conversations[0]?.id ?? null;
  const selected = selectedId
    ? await repository.findAuthorizedConversation(selectedId, session.user.id)
    : null;
  const unreadCount = conversations.filter((conversation) =>
    hasUnreadConversation(conversation, session.user.id)
  ).length;
  const averageProgress = artisans.length
    ? Math.round(
        artisans.reduce((sum, artisan) => sum + artisan.progress, 0) /
          artisans.length
      )
    : 0;
  const activeArtisans = artisans.filter((artisan) => artisan.status !== "INACTIVA");
  const conversationArtisans = artisans.map((artisan) => ({
    id: artisan.id,
    name: artisan.name,
    community: artisan.community,
    specialty: artisan.craftTypes[0] ?? "Emprendimiento artesanal"
  }));

  return (
    <main className="min-h-screen bg-[#fffaf6] text-[#2a211c]">
      <MessageAutoRefresh />
      <section className="border-b border-[#ead4ca] bg-white/80 px-6 py-7 lg:px-10">
        <div className="mx-auto flex max-w-[1680px] flex-wrap items-center justify-between gap-5">
          <div>
            <p className="font-ui text-sm font-bold text-[#8a1747]">
              Mensajes y reportes
            </p>
            <p className="mt-1 text-base text-[#7a5b4a]">
              Comunícate con tus artesanas y consulta el impacto de tu labor.
            </p>
          </div>
          <StartConversationForm artisans={conversationArtisans} />
        </div>
      </section>

      <section className="mx-auto grid max-w-[1680px] gap-6 px-6 py-10 lg:px-10 xl:grid-cols-[1fr_1.45fr_0.85fr]">
        <aside className="overflow-hidden rounded-[20px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
          <header className="border-b border-[#ead4ca] p-6">
            <h1 className="font-display text-3xl">Mensajes</h1>
            <p className="mt-1 text-[#6b5a4e]">
              Conversaciones reales con tus artesanas acompañadas.
            </p>
          </header>

          <form
            action="/facilitadora/mensajes"
            className="space-y-3 border-b border-[#ead4ca] p-4"
          >
            <label className="flex min-h-12 items-center gap-3 rounded-[10px] border border-[#ead4ca] bg-white px-4">
              <Search className="h-5 w-5 text-[#7a5b4a]" />
              <span className="sr-only">Buscar conversación</span>
              <input
                name="q"
                defaultValue={query}
                className="w-full bg-transparent outline-none"
                placeholder="Buscar conversación..."
              />
            </label>
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <Link
                href={
                  showUnreadOnly
                    ? "/facilitadora/mensajes"
                    : "/facilitadora/mensajes?filter=unread"
                }
                className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border border-[#ead4ca] px-4 font-ui font-bold ${
                  showUnreadOnly
                    ? "bg-[#8a1747] text-white"
                    : "bg-white text-[#7a3100]"
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showUnreadOnly ? "Ver todas" : "No leídas"}
              </Link>
              <button className="min-h-12 rounded-[10px] bg-[#7a3100] px-4 font-ui font-bold text-white">
                Buscar
              </button>
            </div>
          </form>

          <ConversationList
            conversations={filteredConversations}
            selectedId={selected?.id ?? null}
            currentUserId={session.user.id}
            query={query}
            filter={params?.filter}
          />
        </aside>

        {selected ? (
          <ConversationPanel conversation={selected} currentUserId={session.user.id} />
        ) : (
          <section className="rounded-[20px] border border-[#eed8bf] bg-white p-8 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <EmptyState
              title="No hay conversaciones todavía"
              description="Abre un nuevo mensaje con una artesana acompañada para empezar."
            />
          </section>
        )}

        <aside className="space-y-5">
          <article className="rounded-[20px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <h2 className="font-display text-3xl">Reportes</h2>
            <p className="mt-1 text-[#6b5a4e]">Resumen rápido de acompañamiento.</p>
            <div className="mt-6 grid gap-4">
              <ReportCard
                icon={<UsersRound className="h-6 w-6" />}
                label="Artesanas activas"
                value={String(activeArtisans.length)}
                detail={`${artisans.length} acompañadas`}
              />
              <ReportCard
                icon={<MessageCircle className="h-6 w-6" />}
                label="Mensajes pendientes"
                value={String(unreadCount)}
                detail={unreadCount ? "Requieren respuesta" : "Todo al día"}
                accent="pink"
              />
              <ReportCard
                icon={<BookOpen className="h-6 w-6" />}
                label="Progreso promedio"
                value={`${averageProgress}%`}
                detail="Según cursos activos"
              />
            </div>
          </article>

          <article className="rounded-[20px] border border-[#eed8bf] bg-white p-6 shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-2xl">Progreso por artesana</h3>
              <BarChart3 className="h-5 w-5 text-[#d89b06]" />
            </div>
            <div className="mt-6 space-y-4">
              {artisans.slice(0, 5).map((artisan) => (
                <div key={artisan.id}>
                  <div className="mb-1 flex justify-between gap-3 text-sm">
                    <span className="truncate">{artisan.name}</span>
                    <span>{artisan.progress}%</span>
                  </div>
                  <span className="block h-2 rounded-full bg-[#efe6dc]">
                    <span
                      className="block h-full rounded-full bg-[#d89b06]"
                      style={{ width: `${artisan.progress}%` }}
                    />
                  </span>
                </div>
              ))}
              {!artisans.length ? (
                <p className="rounded-2xl border border-dashed border-[#ead4ca] p-4 text-sm text-[#7a5b4a]">
                  Aún no tienes artesanas asignadas.
                </p>
              ) : null}
            </div>
          </article>

          <article className="rounded-[20px] border border-[#eed8bf] bg-[#fff8e8] p-6">
            <h3 className="font-display text-2xl">
              Tu acompañamiento marca la diferencia
            </h3>
            <p className="mt-3 text-[#6b5a4e]">
              Cada mensaje y orientación fortalece la confianza digital de las artesanas.
            </p>
          </article>
        </aside>
      </section>
    </main>
  );
}

type ConversationListResult = Awaited<
  ReturnType<ConversationRepository["findForUser"]>
>;
type ConversationSummary = ConversationListResult[number];
type ConversationDetail = NonNullable<
  Awaited<ReturnType<ConversationRepository["findAuthorizedConversation"]>>
>;

type ConversationListProps = {
  conversations: ConversationListResult;
  selectedId: string | null;
  currentUserId: string;
  query?: string;
  filter?: string;
};

function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  query,
  filter
}: ConversationListProps) {
  if (!conversations.length) {
    return (
      <div className="p-5">
        <p className="rounded-2xl border border-dashed border-[#f0c3cf] bg-white p-5 text-sm text-[#7a5b4a]">
          No se encontraron conversaciones.
        </p>
      </div>
    );
  }

  return (
    <div>
      {conversations.map((conversation) => {
        const other = getOtherParticipant(conversation, currentUserId);
        const title = getConversationTitle(conversation, currentUserId);
        const lastMessage = conversation.messages[0];
        const unread = hasUnreadConversation(conversation, currentUserId);
        const href = buildConversationHref(conversation.id, query, filter);

        return (
          <Link
            key={conversation.id}
            href={href}
            className={`flex items-center gap-4 border-b border-[#f1ddcf] p-5 transition-colors duration-300 hover:bg-[#fff5ed] ${
              selectedId === conversation.id ? "bg-[#fff8e8]" : "bg-white"
            }`}
          >
            <Avatar
              image={other?.user.profile?.avatarUrl ?? other?.user.image ?? null}
              name={title}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="truncate font-ui text-base font-extrabold text-[#1b1c1a]">
                  {title}
                </h2>
                <span className="shrink-0 text-xs text-[#7a5b4a]">
                  {formatConversationDate(
                    lastMessage?.createdAt ?? conversation.updatedAt
                  )}
                </span>
              </div>
              <p className="mt-1 truncate text-sm text-[#6b5a4e]">
                {lastMessage?.content ?? "Sin mensajes todavía."}
              </p>
            </div>
            {unread ? (
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#8a0044] text-xs font-bold text-white">
                1
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

function ConversationPanel({
  conversation,
  currentUserId
}: {
  conversation: ConversationDetail;
  currentUserId: string;
}) {
  const other = getOtherParticipant(conversation, currentUserId);
  const title = getConversationTitle(conversation, currentUserId);

  return (
    <section className="flex min-h-[760px] flex-col overflow-hidden rounded-[20px] border border-[#eed8bf] bg-white shadow-[0_20px_50px_rgba(122,73,20,0.07)]">
      <ConversationReadMarker conversationId={conversation.id} />
      <header className="flex items-center justify-between border-b border-[#ead4ca] p-5">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar
            image={other?.user.profile?.avatarUrl ?? other?.user.image ?? null}
            name={title}
          />
          <div className="min-w-0">
            <p className="truncate font-ui text-lg font-bold">{title}</p>
            <p className="truncate text-sm text-[#7a5b4a]">
              {other?.user.profile?.community?.name ?? "Conversación Warmi Digital"}
            </p>
          </div>
        </div>
        <Info className="h-6 w-6 shrink-0 text-[#7a3100]" />
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto bg-[linear-gradient(135deg,rgba(255,248,232,0.5),rgba(255,250,246,0.9))] p-6">
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
          <EmptyState
            title="Esta conversación aún no tiene mensajes"
            description="Escribe el primer mensaje para acompañar a esta artesana."
          />
        )}
      </div>

      <footer className="border-t border-[#ead4ca] bg-white p-5">
        <MessageComposer conversationId={conversation.id} />
      </footer>
    </section>
  );
}

function ReportCard({
  icon,
  label,
  value,
  detail,
  accent = "gold"
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  accent?: "gold" | "pink";
}) {
  return (
    <div className="rounded-[16px] border border-[#eed8bf] p-5">
      <span
        className={`grid h-12 w-12 place-items-center rounded-full ${
          accent === "pink"
            ? "bg-[#fde2ec] text-[#8a1747]"
            : "bg-[#fff2cf] text-[#d89b06]"
        }`}
      >
        {icon}
      </span>
      <p className="mt-3 text-sm text-[#6b5a4e]">{label}</p>
      <p className="font-display text-4xl">{value}</p>
      <p className="text-sm text-emerald-700">{detail}</p>
    </div>
  );
}

function Avatar({ image, name }: { image: string | null; name: string }) {
  return (
    <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-[#fff1e5] text-[#b5245b]">
      {image ? (
        <Image src={image} alt={name} fill sizes="56px" className="object-cover" />
      ) : (
        <Send className="h-5 w-5" />
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
        className={`max-w-[720px] rounded-[16px] border px-5 py-4 shadow-[0_12px_28px_rgba(122,49,0,0.06)] ${
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

function getOtherParticipant(
  conversation: ConversationSummary | ConversationDetail,
  currentUserId: string
) {
  return conversation.participants.find(
    (participant) => participant.userId !== currentUserId
  );
}

function getConversationTitle(
  conversation: ConversationSummary | ConversationDetail,
  currentUserId: string
) {
  const other = getOtherParticipant(conversation, currentUserId)?.user;
  return (
    conversation.title ??
    other?.profile?.displayName ??
    other?.name ??
    other?.email ??
    "Conversación"
  );
}

function hasUnreadConversation(
  conversation: ConversationSummary,
  currentUserId: string
) {
  const currentParticipant = conversation.participants.find(
    (participant) => participant.userId === currentUserId
  );
  const lastMessage = conversation.messages[0];

  return Boolean(
    lastMessage &&
      lastMessage.senderId !== currentUserId &&
      (!currentParticipant?.lastReadAt ||
        lastMessage.createdAt > currentParticipant.lastReadAt)
  );
}

function buildConversationHref(
  conversationId: string,
  query?: string,
  filter?: string
) {
  const params = new URLSearchParams({ conversation: conversationId });
  if (query) params.set("q", query);
  if (filter) params.set("filter", filter);
  return `/facilitadora/mensajes?${params.toString()}`;
}

function formatConversationDate(date: Date) {
  return format(date, "dd MMM", { locale: es });
}
