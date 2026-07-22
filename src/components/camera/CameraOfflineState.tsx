import { CameraSleepingState } from "@/components/camera/CameraSleepingState";

export function CameraOfflineState({ compact = false }: { compact?: boolean }) {
  return <CameraSleepingState compact={compact} />;
}
