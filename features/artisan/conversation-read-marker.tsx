"use client";

import { useEffect } from "react";

import { markArtisanConversationReadAction } from "@/shared/actions/artisan/messages";

type ConversationReadMarkerProps = {
  conversationId: string;
};

export function ConversationReadMarker({
  conversationId
}: ConversationReadMarkerProps) {
  useEffect(() => {
    void markArtisanConversationReadAction(conversationId);
  }, [conversationId]);

  return null;
}
