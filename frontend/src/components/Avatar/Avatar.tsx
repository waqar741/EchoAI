/**
 * Avatar – Circular avatar with shadow-based glow effects
 * 
 * States:
 *  • Idle: Subtle blue shadow behind the image
 *  • Speaking: Pulsing cyan shadow (energy effect)
 *  • Listening: Steady blue ring glow
 */

import { memo } from "react";
import { AVATAR } from "../../utils/constants";
import { useChatStore } from "../../store/chatStore";
import { RealisticAvatar } from "./RealisticAvatar";
import { PhotoAvatar } from "./PhotoAvatar";
import { GifAvatar } from "./GifAvatar";
import { StaticAvatar } from "./StaticAvatar";

interface AvatarProps {
  isSpeaking: boolean;
}

export const Avatar = memo(function Avatar({ isSpeaking }: AvatarProps) {
  const avatarType = useChatStore((s) => s.avatarType);
  const status = useChatStore((s) => s.status);

  const isListening = status === "listening";

  // Determine shadow based on state
  const getShadowStyle = () => {
    if (isSpeaking) {
      // Speaking: Pulsing cyan shadow
      return {
        boxShadow: "0 0 30px 10px rgba(6, 182, 212, 0.6), 0 0 60px 20px rgba(6, 182, 212, 0.3)",
      };
    }
    if (isListening) {
      // Listening: Steady blue ring
      return {
        boxShadow: "0 0 25px 8px rgba(59, 130, 246, 0.5), 0 0 50px 15px rgba(59, 130, 246, 0.2)",
      };
    }
    // Idle: Subtle blue shadow
    return {
      boxShadow: "0 0 20px 5px rgba(59, 130, 246, 0.2), 0 0 40px 10px rgba(6, 182, 212, 0.1)",
    };
  };

  return (
    <figure
      className="relative flex items-center justify-center"
      role="img"
      aria-label={`Voice avatar – ${avatarType} mode`}
    >
      {/* Avatar container with shadow-based glow */}
      <div
        className={`
          relative overflow-hidden rounded-full
          transition-all duration-500 ease-out
          ${isSpeaking ? "animate-glow-pulse" : ""}
        `}
        style={{
          width: AVATAR.DISPLAY_SIZE,
          height: AVATAR.DISPLAY_SIZE,
          ...getShadowStyle(),
        }}
      >
        {/* Avatar renderer */}
        {avatarType === "realistic" && <RealisticAvatar isSpeaking={isSpeaking} />}
        {avatarType === "photo" && <PhotoAvatar isSpeaking={isSpeaking} />}
        {avatarType === "gif" && <GifAvatar isSpeaking={isSpeaking} />}
        {avatarType === "image" && <StaticAvatar isSpeaking={isSpeaking} />}
      </div>
    </figure>
  );
});
