import type { ChatMessage } from "@/lib/chat-delivery";

export function ChatDeliveryStatus({ message, retry, disabled }: {
  message: ChatMessage; retry: () => void; disabled: boolean;
}) {
  if (message.delivery === "sending") return <span role="status" className="text-xs">전송 중…</span>;
  if (message.delivery === "failed") return (
    <div role="alert" className="mt-2 text-xs bg-white text-red-800 rounded-lg p-2">
      <p>전송 확인 실패 · {message.error}</p>
      <button type="button" disabled={disabled} onClick={retry}
        className="mt-1 underline font-bold disabled:opacity-40">재시도</button>
    </div>
  );
  return <span className="text-[10px]">{message.isRead ? "읽음" : "전송 완료 · 안읽음"}</span>;
}
