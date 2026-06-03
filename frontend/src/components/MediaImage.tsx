import { ImgHTMLAttributes, SyntheticEvent } from "react";

type MediaImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK_SRC = "/logo.png";

const MediaImage = ({
  fallbackSrc = DEFAULT_FALLBACK_SRC,
  onError,
  src,
  ...props
}: MediaImageProps) => {
  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    onError?.(event);
    const image = event.currentTarget;
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = fallbackSrc;
  };

  return <img src={src || fallbackSrc} onError={handleError} {...props} />;
};

export default MediaImage;
