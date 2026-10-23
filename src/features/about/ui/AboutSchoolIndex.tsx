"use client";

import { useEffect, useRef, type MouseEvent, type RefObject } from "react";

import type { Dictionary } from "@/lib/i18n/get-dictionary";

const SCROLL_DURATION_MS = 780;

type AboutSchoolIndexProps = {
  label: string;
  teachersLabel: string;
  about: Dictionary["about"];
};

export function AboutSchoolIndex({
  label,
  teachersLabel,
  about,
}: AboutSchoolIndexProps) {
  const frameId = useRef(0);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const items = indexItems(teachersLabel, about);
  useRowScroll(scrollerRef);

  function scrollToSection(event: MouseEvent<HTMLAnchorElement>, id: string): void {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) {
      return;
    }

    const top = window.scrollY + target.getBoundingClientRect().top - 24;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      window.scrollTo(0, top);
    } else {
      animateScroll(top, frameId);
    }

    window.history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav aria-label={label} className="min-w-0 overflow-hidden border-b border-black/10 bg-white">
      <ul
        ref={scrollerRef}
        className="mx-auto flex w-full min-w-0 max-w-[1440px] cursor-grab touch-pan-y gap-3 overflow-x-auto overscroll-x-contain px-4 py-5 select-none [scrollbar-width:none] active:cursor-grabbing sm:px-8 lg:px-[84px] [&::-webkit-scrollbar]:hidden [&_a]:cursor-grab"
      >
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              onClick={(event) => scrollToSection(event, item.id)}
              className="inline-flex h-11 items-center rounded-full border border-black/15 px-4 text-sm font-medium text-[#030303] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function useRowScroll(scrollerRef: RefObject<HTMLUListElement | null>): void {
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }

    const row = scroller;
    const drag = createDragState();

    function onWheel(event: WheelEvent): void {
      scrollRow(row, event);
    }

    function onPointerDown(event: PointerEvent): void {
      beginDrag(row, drag, event);
    }

    function onPointerMove(event: PointerEvent): void {
      moveDrag(row, drag, event);
    }

    function onPointerUp(event: PointerEvent): void {
      endDrag(row, drag, event);
    }

    row.addEventListener("wheel", onWheel, { passive: false });
    row.addEventListener("pointerdown", onPointerDown);
    row.addEventListener("pointermove", onPointerMove);
    row.addEventListener("pointerup", onPointerUp);
    row.addEventListener("pointercancel", onPointerUp);
    return () => {
      row.removeEventListener("wheel", onWheel);
      row.removeEventListener("pointerdown", onPointerDown);
      row.removeEventListener("pointermove", onPointerMove);
      row.removeEventListener("pointerup", onPointerUp);
      row.removeEventListener("pointercancel", onPointerUp);
    };
  }, [scrollerRef]);
}

type DragState = {
  active: boolean;
  moved: boolean;
  pointerId: number;
  startX: number;
  startScroll: number;
};

const DRAG_THRESHOLD_PX = 6;

function createDragState(): DragState {
  return { active: false, moved: false, pointerId: -1, startX: 0, startScroll: 0 };
}

function beginDrag(row: HTMLElement, drag: DragState, event: PointerEvent): void {
  if (event.button !== 0) {
    return;
  }

  drag.active = true;
  drag.moved = false;
  drag.pointerId = event.pointerId;
  drag.startX = event.clientX;
  drag.startScroll = row.scrollLeft;
}

function moveDrag(row: HTMLElement, drag: DragState, event: PointerEvent): void {
  if (!drag.active || event.pointerId !== drag.pointerId) {
    return;
  }

  const delta = event.clientX - drag.startX;
  if (!drag.moved && Math.abs(delta) < DRAG_THRESHOLD_PX) {
    return;
  }

  if (!drag.moved) {
    drag.moved = true;
    row.setPointerCapture(event.pointerId);
  }

  row.scrollLeft = drag.startScroll - delta;
}

function endDrag(row: HTMLElement, drag: DragState, event: PointerEvent): void {
  if (!drag.active || event.pointerId !== drag.pointerId) {
    return;
  }

  drag.active = false;
  if (row.hasPointerCapture(event.pointerId)) {
    row.releasePointerCapture(event.pointerId);
  }

  if (drag.moved) {
    row.addEventListener("click", blockDragClick, { capture: true, once: true });
  }
}

function blockDragClick(event: Event): void {
  event.preventDefault();
  event.stopPropagation();
}

function scrollRow(scroller: HTMLElement, event: WheelEvent): void {
  const maxScroll = scroller.scrollWidth - scroller.clientWidth;
  if (maxScroll <= 0) {
    return;
  }

  const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (delta === 0) {
    return;
  }

  const next = Math.min(Math.max(scroller.scrollLeft + delta, 0), maxScroll);
  if (next === scroller.scrollLeft) {
    return;
  }

  event.preventDefault();
  scroller.scrollLeft = next;
}

function indexItems(teachersLabel: string, about: Dictionary["about"]) {
  return [
    { id: "history", label: about.history.title },
    { id: "mission", label: about.mission.title },
    { id: "values", label: about.values.title },
    { id: "achievements", label: about.experience.achievementsTitle },
    { id: "competitions", label: about.experience.competitionsTitle },
    { id: "international", label: about.experience.internationalTitle },
    { id: "teachers", label: teachersLabel },
    { id: "directions", label: about.practice.directionsTitle },
    { id: "programs", label: about.practice.programsTitle },
    { id: "halls", label: about.practice.hallsTitle },
    { id: "groups", label: about.practice.groupsTitle },
  ];
}

function animateScroll(
  top: number,
  frameId: { current: number },
): void {
  const start = window.scrollY;
  const distance = top - start;
  const startedAt = performance.now();
  const animationId = frameId.current + 1;
  frameId.current = animationId;

  function frame(now: number): void {
    if (frameId.current !== animationId) {
      return;
    }

    const progress = Math.min((now - startedAt) / SCROLL_DURATION_MS, 1);
    window.scrollTo(0, start + distance * easeOutCubic(progress));
    if (progress < 1) {
      requestAnimationFrame(frame);
    }
  }

  requestAnimationFrame(frame);
}

function easeOutCubic(progress: number): number {
  return 1 - (1 - progress) ** 3;
}
