import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router";
import {
  useFloating, useHover, useFocus, useDismiss, useRole, useInteractions,
  safePolygon, offset, shift, autoUpdate, FloatingPortal,
} from "@floating-ui/react";
import { primaryAction, type Project } from "../../data/projects";
import PreviewCard from "./PreviewCard";

// Wraps a rack unit (node, amp, Pi) so it's a real link with a hover card.
// - mouse: hover shows the card, click opens the project
// - keyboard: focus shows the card, Enter opens the project
// - touch: first tap shows the card, the buttons in the card open it


// only one card open at a time: opening a card closes whichever was open before
let closeOpenCard: (() => void) | null = null;

export default function ProjectTarget({ project, className, style, children }: {
  project: Project;
  className: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const [open, setOpenState] = useState(false);
  const pointer = useRef<string>("mouse");

  const setOpen = (next: boolean) => {
    if (next) {
      if (closeOpenCard) closeOpenCard();
      closeOpenCard = () => setOpenState(false);
    }
    setOpenState(next);
  };

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "right",
    strategy: "fixed",
    middleware: [offset(28), shift({ padding: 16, crossAxis: true })],    // follow the unit while the camera moves it
    whileElementsMounted: (ref, float, update) => autoUpdate(ref, float, update, { animationFrame: true }),
  });

  // position the card beside the RACK (not the unit) so it never covers
  // the neighbouring units, lined up vertically with the hovered unit
  useLayoutEffect(() => {
    const el = refs.domReference.current as HTMLElement | null;
    const rack = el?.closest<HTMLElement>(".rack");
    if (!el || !rack) return;
    refs.setPositionReference({
      getBoundingClientRect() {
        const u = el.getBoundingClientRect();
        const r = rack.getBoundingClientRect();
        return { x: r.left, y: u.top, left: r.left, top: u.top, right: r.right, bottom: u.bottom, width: r.width, height: u.height } as DOMRect;
      },
    });
  }, [refs, open]);

  const hover = useHover(context, { delay: { open: 120, close: 90 }, handleClose: safePolygon(), mouseOnly: true });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "dialog" });
  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  const action = primaryAction(project);
  const label = `${project.name}: ${action.label}`;

  const props = getReferenceProps({
    ref: refs.setReference,
    className: `${className} project-target`,
    style,
    "aria-label": label,
    onPointerDown: (e: React.PointerEvent) => { pointer.current = e.pointerType; },
    // on touch, the first tap only opens the card
    onClick: (e: React.MouseEvent) => {
      if (pointer.current === "touch" && !open) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      // mouse click: close the card and drop focus, so it doesn't stay
      // stuck open when you come back from the new tab
      if (pointer.current === "mouse") {
        setOpen(false);
        (e.currentTarget as HTMLElement).blur();
      }
    },
  } as React.HTMLProps<HTMLElement>);

  return (
    <>
      {action.external ? (
        <a {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)} href={action.href} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ) : (
        <Link {...(props as object)} to={action.href} target="_blank" rel="noopener noreferrer">
          {children}
        </Link>
      )}

      {open && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} className="preview-layer" {...getFloatingProps()}>
            <PreviewCard project={project} />
          </div>
        </FloatingPortal>
      )}
    </>
  );
}