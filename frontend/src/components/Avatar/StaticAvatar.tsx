import { memo } from "react";
import { AVATAR } from "../../utils/constants";
import { useChatStore } from "../../store/chatStore";

interface Props {
    isSpeaking: boolean;
}

export const StaticAvatar = memo(function StaticAvatar({ isSpeaking }: Props) {
    const avatarId = useChatStore((s) => s.avatarId);

    // Map ID to filename
    const getImageUrl = () => {
        switch (avatarId) {
            case "friendly-robo":
                return "/assets/avatars/friendly-robo.jpg";
            case "gradient-ai-robo":
                return "/assets/avatars/gradient-ai-robo.jpg";
            default:
                return "/assets/avatars/friendly-robo.jpg";
        }
    };

    return (
        <img
            src={getImageUrl()}
            alt="Avatar"
            className={`
        rounded-full object-cover
        transition-all duration-300
        ${isSpeaking ? "scale-105 brightness-110" : "scale-100 brightness-100"}
      `}
            style={{
                width: AVATAR.DISPLAY_SIZE,
                height: AVATAR.DISPLAY_SIZE,
                imageRendering: "auto",
                // Ensure good quality for photos
            }}
        />
    );
});

