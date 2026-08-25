"use client";

import { useEffect } from "react";

import { markFacilitatorConversationReadAction } from "@/shared/actions/facilitator/actions";

type ConversationReadMarkerProps = {
  conversationId: string;
};

export function ConversationReadMarker({
  conversationId
}: ConversationReadMarkerProps) {
  useEffect(() => {
    void markFacilitatorConversationReadAction(conversationId);
  }, [conversationId]);

  return null;
}
