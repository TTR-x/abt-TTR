
'use client';

import Link, { type LinkProps } from 'next/link';
import { useLoading } from '@/context/loading-provider';
import { usePathname } from 'next/navigation';
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingLinkProps extends LinkProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const LoadingLink = React.forwardRef<HTMLAnchorElement, LoadingLinkProps>(
  ({ children, href, className, onClick, ...props }, ref) => {
    const { setIsLoading } = useLoading();
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // Always set loading to true to show the indicator immediately.
      // The indicator will be hidden by the GlobalLoadingIndicator's useEffect
      // when the new page's pathname is detected.
      setIsLoading(true);

      // If a custom onClick is provided, execute it.
      // The parent can call e.preventDefault() to stop the navigation if needed.
      if (onClick) {
        onClick(e);
      }
    };

    // Use a regular <a> tag if href is not provided or is just a hash
    if (!href || href.toString().startsWith('#')) {
        return (
             <a href={href?.toString()} onClick={handleClick} className={cn(className)} ref={ref} {...(props as React.ComponentPropsWithoutRef<'a'>)}>
                {children}
            </a>
        )
    }

    return (
      <Link href={href} onClick={handleClick} className={className} ref={ref} {...props}>
        {children}
      </Link>
    );
  }
);

LoadingLink.displayName = 'LoadingLink';

export default LoadingLink;
