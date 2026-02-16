import Image from "next/image";
import type { SVGProps } from "react";

export const Icons = {
  logo: (props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'> & { alt?: string }) => (
    <Image
      src="/favicon.png"
      alt={props.alt || "TTR Gestion Logo"}
      width={128}
      height={128}
      {...props}
    />
  ),
};
