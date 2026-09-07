import { html, LitElement, nothing } from "lit";
import { keyed } from "lit/directives/keyed.js";

type CategoryValue = string | number | { id?: string | number; value?: string | number } | Array<string | number | { id?: string | number; value?: string | number }>;
type ConfiguredTab = { title?: string; category?: CategoryValue };
type NationalDayConfig = { hero_desktop?: unknown; hero_mobile?: unknown; bottom_desktop?: unknown; bottom_mobile?: unknown; active_tab_background?: string; active_tab_text?: string; inactive_tab_text?: string; inactive_tab_border?: string; tabs?: ConfiguredTab[] };
type ResolvedTab = { id: string; title: string; categoryId: string };

/** Campaign framing for a native Salla product list. It owns no product-card markup. */
export default class NationalDayProducts extends LitElement {
  static properties = {
    config: { type: Object },
  };

  config?: NationalDayConfig;
  private activeTabId = "";

  /** Light DOM deliberately leaves Beginning's card CSS/custom element available to the native list. */
  createRenderRoot() { return this; }

  protected willUpdate(): void {
    const tabs = this.tabs;
    if (!tabs.some((tab) => tab.id === this.activeTabId)) this.activeTabId = tabs[0]?.id ?? "";
  }

  private get tabs(): ResolvedTab[] {
    return (Array.isArray(this.config?.tabs) ? this.config.tabs : []).map((tab, index) => {
      const title = typeof tab?.title === "string" ? tab.title.trim() : "";
      const categoryId = this.categoryId(tab?.category);
      return title && categoryId ? { id: `${index}-${categoryId}`, title, categoryId } : null;
    }).filter((tab): tab is ResolvedTab => tab !== null);
  }

  private get activeTab(): ResolvedTab | undefined { return this.tabs.find((tab) => tab.id === this.activeTabId); }

  private categoryId(value: CategoryValue | undefined): string {
    const selected = Array.isArray(value) ? value[0] : value;
    if (typeof selected === "string" || typeof selected === "number") return String(selected);
    if (selected && typeof selected === "object") {
      const id = selected.id ?? selected.value;
      return id === undefined || id === null ? "" : String(id);
    }
    return "";
  }

  private imageUrl(value: unknown): string {
    if (typeof value === "string") return value.trim();
    if (value && typeof value === "object") {
      const candidate = value as { url?: unknown; value?: unknown };
      if (typeof candidate.url === "string") return candidate.url.trim();
      if (typeof candidate.value === "string") return candidate.value.trim();
    }
    return "";
  }

  private selectTab(tab: ResolvedTab, event: Event): void {
    this.activeTabId = tab.id;
    this.requestUpdate();
    (event.currentTarget as HTMLButtonElement).scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }

  private onTabKeydown(event: KeyboardEvent): void {
    const tabs = this.tabs, current = tabs.findIndex((tab) => tab.id === this.activeTabId);
    if (current < 0 || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const rtl = getComputedStyle(this).direction === "rtl";
    let next = current;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = tabs.length - 1;
    if (event.key === "ArrowLeft") next = (current + (rtl ? 1 : -1) + tabs.length) % tabs.length;
    if (event.key === "ArrowRight") next = (current + (rtl ? -1 : 1) + tabs.length) % tabs.length;
    this.activeTabId = tabs[next].id;
    this.requestUpdate();
    queueMicrotask(() => this.querySelector<HTMLButtonElement>(`#national-day-tab-${CSS.escape(this.activeTabId)}`)?.focus());
  }

  private renderCampaignImage(desktop: unknown, mobile: unknown, className: string) {
    const desktopUrl = this.imageUrl(desktop), mobileUrl = this.imageUrl(mobile);
    if (!desktopUrl && !mobileUrl) return nothing;
    return html`<picture class=${className}>${mobileUrl ? html`<source media="(max-width: 767px)" srcset=${mobileUrl} />` : nothing}<img src=${desktopUrl || mobileUrl} alt="" /></picture>`;
  }

  render() {
    const tabs = this.tabs, active = this.activeTab;
    const style = `--nd-active-bg:${this.config?.active_tab_background || "#006c58"};--nd-active-text:${this.config?.active_tab_text || "#fff"};--nd-inactive-text:${this.config?.inactive_tab_text || "#164a40"};--nd-inactive-border:${this.config?.inactive_tab_border || "#b8cfc8"}`;
    return html`
      <style>
        .national-day-products{box-sizing:border-box;inline-size:100%;max-inline-size:1440px;margin-inline:auto;padding:clamp(12px,2vw,28px);color:inherit;direction:inherit}.national-day-products *,.national-day-products *:before,.national-day-products *:after{box-sizing:border-box}.national-day-products__image{display:block;inline-size:100%;overflow:hidden;border-radius:18px}.national-day-products__image img{display:block;inline-size:100%;block-size:auto}.national-day-products__tabs{margin-block:clamp(16px,2.5vw,28px)}.national-day-products__rail{display:flex;flex-wrap:nowrap;gap:10px;overflow-x:auto;overscroll-behavior-inline:contain;padding-block:4px 8px;padding-inline:2px;scrollbar-width:thin;scrollbar-color:transparent transparent;-webkit-overflow-scrolling:touch}.national-day-products__rail:hover{scrollbar-color:var(--nd-inactive-border) transparent}.national-day-products__tab{flex:0 0 auto;min-inline-size:max-content;border:1px solid var(--nd-inactive-border);border-radius:999px;background:transparent;color:var(--nd-inactive-text);font:inherit;font-size:clamp(.9rem,1.4vw,1rem);font-weight:600;line-height:1.35;padding-block:.7rem;padding-inline:1.1rem;cursor:pointer;white-space:nowrap;transition:background-color .16s ease,border-color .16s ease,color .16s ease}.national-day-products__tab[aria-selected=true]{border-color:var(--nd-active-bg);background:var(--nd-active-bg);color:var(--nd-active-text)}.national-day-products__tab:focus-visible{outline:3px solid var(--nd-active-bg);outline-offset:2px}.national-day-products__products{min-inline-size:0}.national-day-products__empty{margin:0;padding:1rem;border:1px dashed var(--nd-inactive-border);border-radius:12px;color:var(--nd-inactive-text);text-align:center}.national-day-products__bottom{margin-block-start:clamp(24px,4vw,56px)}@media(max-width:767px){.national-day-products{padding-inline:12px}.national-day-products__rail{gap:8px}.national-day-products__tab{min-inline-size:8.8rem;padding-inline:.9rem}.national-day-products__image{border-radius:12px}}
      </style>
      <section class="national-day-products" style=${style} dir="auto">
        ${this.renderCampaignImage(this.config?.hero_desktop, this.config?.hero_mobile, "national-day-products__image")}
        <div class="national-day-products__tabs">${tabs.length ? html`<div class="national-day-products__rail" role="tablist" aria-label="تصنيفات المنتجات" @keydown=${this.onTabKeydown}>${tabs.map((tab) => html`<button id="national-day-tab-${tab.id}" class="national-day-products__tab" type="button" role="tab" aria-selected=${String(tab.id === active?.id)} tabindex=${tab.id === active?.id ? "0" : "-1"} @click=${(event: Event) => this.selectTab(tab, event)}>${tab.title}</button>`)}</div>` : html`<p class="national-day-products__empty">لم يتم إعداد تصنيفات للعرض بعد.</p>`}</div>
        ${active ? keyed(active.id, html`<div class="national-day-products__products" role="tabpanel" aria-labelledby="national-day-tab-${active.id}"><salla-products-list source="categories" source-value=${JSON.stringify([active.categoryId])} autoload></salla-products-list></div>`) : nothing}
        ${this.renderCampaignImage(this.config?.bottom_desktop, this.config?.bottom_mobile, "national-day-products__image national-day-products__bottom")}
      </section>`;
  }
}
