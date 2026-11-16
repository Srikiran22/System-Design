import { Link } from "@tanstack/react-router";
import type { ComponentProps } from "react";

export function splitHref(href: string) {
  const [path = "", hash] = href.split("#");
  const [to, qs] = path.split("?");
  const search = qs ? Object.fromEntries(new URLSearchParams(qs)) : undefined;
  return { to: to || "/", hash: hash || undefined, search };
}

type Props = Omit<ComponentProps<"a">, "href"> & { href: string };

/** Thin wrapper so components can keep a simple `href` API. */
export default function AppLink({ href, ...rest }: Props) {
  const { to, hash, search } = splitHref(href);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Link to={to as any} hash={hash} search={search as any} {...(rest as any)} />;
}
