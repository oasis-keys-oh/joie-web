'use client'

import { useEffect } from 'react'
import type { Metadata } from 'next'

// Note: metadata cannot be exported from a 'use client' file.
// SEO is handled via the root layout's metadata + page-level <title> below.

export default function MarketingLanding() {
  useEffect(() => {
    // Nav scroll behavior
    const nav = document.getElementById('mkt-nav')
    if (!nav) return
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })

    // Mobile nav toggle
    const toggle = document.getElementById('mkt-nav-toggle')
    const links  = document.getElementById('mkt-nav-links')
    toggle?.addEventListener('click', () => links?.classList.toggle('open'))

    // Fade-up on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          observer.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })
    document.querySelectorAll('.mkt-fade-up').forEach(el => observer.observe(el))

    // Hero photo cycling
    const slides = document.querySelectorAll('.mkt-hero-slide')
    let current = 0
    let interval: ReturnType<typeof setInterval> | null = null
    if (slides.length > 1) {
      interval = setInterval(() => {
        slides[current].classList.remove('active')
        current = (current + 1) % slides.length
        slides[current].classList.add('active')
      }, 6000)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (interval) clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      {/* ─── Google Fonts + Marketing CSS ──────────────────────── */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />

      <style>{`
        /* ─── Reset & Base ─────────────────────────────────────── */
        .mkt-root *, .mkt-root *::before, .mkt-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .mkt-root {
          --bg:           #080808;
          --surface:      #101010;
          --border:       rgba(255,255,255,0.07);
          --gold:         #C4A35A;
          --gold-dim:     rgba(196,163,90,0.15);
          --gold-border:  rgba(196,163,90,0.25);
          --text:         #F0EBE3;
          --text-muted:   #8A857E;
          --text-dim:     #3E3A35;
          --text-soft:    #C8C2BA;
          --serif:  'Cormorant Garamond', Georgia, serif;
          --sans:   'DM Sans', system-ui, sans-serif;
          --max-w: 1140px;
          --gutter: clamp(1.5rem, 5vw, 3rem);
          --ease: cubic-bezier(0.4, 0, 0.2, 1);

          background: var(--bg);
          color: var(--text);
          font-family: var(--sans);
          font-weight: 300;
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
          scroll-behavior: smooth;
        }

        .mkt-root img { display: block; max-width: 100%; }
        .mkt-root a   { color: inherit; text-decoration: none; }

        .mkt-container {
          max-width: var(--max-w);
          margin: 0 auto;
          padding: 0 var(--gutter);
        }

        .mkt-eyebrow {
          font-family: var(--sans);
          font-size: 0.6875rem;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
        }

        /* ─── Nav ─────────────────────────────────────────────── */
        #mkt-nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 1.5rem var(--gutter);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: background 0.4s var(--ease), border-color 0.4s var(--ease);
          border-bottom: 1px solid transparent;
        }
        #mkt-nav.scrolled {
          background: rgba(8,8,8,0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-color: var(--border);
        }
        .mkt-nav-logo { display: flex; flex-direction: column; line-height: 1; }
        .mkt-nav-logo-name {
          font-family: var(--sans); font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.25em; text-transform: uppercase; color: var(--text);
        }
        .mkt-nav-logo-product {
          font-family: var(--sans); font-size: 0.6rem; font-weight: 300;
          letter-spacing: 0.3em; text-transform: uppercase; color: var(--gold); margin-top: 0.25rem;
        }
        #mkt-nav-links {
          display: flex; align-items: center; gap: 2.5rem;
        }
        #mkt-nav-links a {
          font-size: 0.75rem; font-weight: 400; letter-spacing: 0.12em;
          text-transform: uppercase; color: var(--text-muted); transition: color 0.2s;
        }
        #mkt-nav-links a:hover { color: var(--text); }
        .mkt-nav-client {
          font-size: 0.7rem !important; color: var(--gold) !important;
          opacity: 0.7; transition: opacity 0.2s !important;
        }
        .mkt-nav-client:hover { opacity: 1 !important; }

        .mkt-btn {
          display: inline-flex; align-items: center; gap: 0.5rem;
          padding: 0.65rem 1.5rem; font-family: var(--sans); font-size: 0.7rem;
          font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase;
          border: 1px solid var(--gold-border); color: var(--gold);
          background: transparent; cursor: pointer;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .mkt-btn:hover { background: var(--gold); color: var(--bg); border-color: var(--gold); }
        .mkt-btn-primary { background: var(--gold); color: var(--bg); border-color: var(--gold); }
        .mkt-btn-primary:hover { background: #D4B36A; border-color: #D4B36A; }
        .mkt-btn-outline { background: transparent; color: var(--gold); border-color: var(--gold-border); }

        .mkt-nav-toggle {
          display: none; flex-direction: column; gap: 5px; cursor: pointer;
          padding: 4px; background: transparent; border: none; outline: none;
        }
        .mkt-nav-toggle span { display: block; width: 22px; height: 1px; background: var(--text); }

        @media (max-width: 768px) {
          #mkt-nav-links { display: none; }
          #mkt-nav-links.open {
            display: flex; flex-direction: column; position: absolute;
            top: 100%; left: 0; right: 0; background: rgba(8,8,8,0.98);
            padding: 2rem var(--gutter); border-top: 1px solid var(--border); gap: 1.5rem;
          }
          .mkt-nav-toggle { display: flex; }
        }

        /* ─── Hero ────────────────────────────────────────────── */
        .mkt-hero {
          position: relative; min-height: 100svh;
          display: flex; align-items: center; overflow: hidden;
        }
        .mkt-hero-bg { position: absolute; inset: 0; z-index: 0; background-color: #080808; }
        .mkt-hero-slide {
          position: absolute; inset: 0; background-size: cover;
          background-position: center; opacity: 0; transition: opacity 1.8s ease-in-out;
        }
        .mkt-hero-slide.active { opacity: 1; }
        .mkt-hero-slide-1 { background-image: url('/assets/hero-1.jpg'); }
        .mkt-hero-slide-2 { background-image: url('/assets/hero-2.jpg'); }
        .mkt-hero-slide-3 { background-image: url('/assets/hero-3.jpg'); }
        .mkt-hero-slide-4 { background-image: url('/assets/hero-4.jpg'); }
        .mkt-hero-slide-5 { background-image: url('/assets/hero-5.jpg'); }
        .mkt-hero-bg::before {
          content: ''; position: absolute; inset: 0; z-index: -1;
          background: linear-gradient(160deg, #0A0906 0%, #111008 40%, #080808 100%);
        }
        .mkt-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to right, rgba(8,8,8,0.85) 40%, rgba(8,8,8,0.2) 100%);
        }
        .mkt-hero-content {
          position: relative; z-index: 1; max-width: 680px;
          padding: calc(6rem + var(--gutter)) var(--gutter) 6rem;
          margin: 0 auto 0 calc((100vw - var(--max-w)) / 2 + var(--gutter));
        }
        @media (max-width: 1200px) { .mkt-hero-content { margin-left: var(--gutter); } }
        .mkt-hero-eyebrow {
          font-size: 0.625rem; font-weight: 500; letter-spacing: 0.25em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 2rem;
          display: flex; align-items: center; gap: 1rem;
        }
        .mkt-hero-eyebrow::before {
          content: ''; display: block; width: 2rem; height: 1px;
          background: var(--gold); flex-shrink: 0;
        }
        .mkt-hero h1 {
          font-family: var(--serif); font-size: clamp(2.75rem, 6vw, 5rem);
          font-weight: 300; line-height: 1.08; letter-spacing: -0.01em;
          color: var(--text); margin-bottom: 1.75rem;
        }
        .mkt-hero h1 em { font-style: italic; color: var(--gold); }
        .mkt-hero-sub {
          font-size: clamp(0.875rem, 1.5vw, 1rem); font-weight: 300;
          line-height: 1.7; color: var(--text-muted); max-width: 460px; margin-bottom: 3rem;
        }
        .mkt-hero-cta { display: flex; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
        .mkt-hero-scroll {
          position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
          z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
        }
        .mkt-hero-scroll span {
          font-size: 0.5625rem; letter-spacing: 0.25em; text-transform: uppercase;
          color: var(--text-muted); writing-mode: vertical-rl;
        }
        .mkt-hero-scroll::after {
          content: ''; display: block; width: 1px; height: 3rem;
          background: linear-gradient(to bottom, var(--gold), transparent);
          animation: mktScrollLine 2s ease-in-out infinite;
        }
        @keyframes mktScrollLine {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(0.6); }
        }

        /* ─── Philosophy ──────────────────────────────────────── */
        .mkt-philosophy {
          padding: 5rem var(--gutter);
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .mkt-philosophy-inner {
          max-width: var(--max-w); margin: 0 auto;
          display: grid; grid-template-columns: 1fr auto 1fr;
          align-items: center; gap: 3rem;
        }
        .mkt-phil-rule { width: 100%; height: 1px; background: linear-gradient(to right, transparent, var(--gold-border)); }
        .mkt-phil-rule.right { background: linear-gradient(to left, transparent, var(--gold-border)); }
        .mkt-philosophy-text { text-align: center; max-width: 520px; }
        .mkt-philosophy-arabic { font-size: 1.5rem; color: var(--gold); margin-bottom: 1.25rem; font-weight: 300; letter-spacing: 0.05em; }
        .mkt-philosophy-text p {
          font-family: var(--serif); font-size: clamp(1rem, 2vw, 1.25rem);
          font-weight: 300; font-style: italic; line-height: 1.7; color: var(--text-muted);
        }
        .mkt-philosophy-text p strong { font-style: normal; font-weight: 400; color: var(--text); }
        @media (max-width: 640px) {
          .mkt-philosophy-inner { grid-template-columns: 1fr; gap: 1.5rem; }
          .mkt-phil-rule { display: none; }
        }

        /* ─── How It Works ────────────────────────────────────── */
        .mkt-how { padding: 7rem var(--gutter); }
        .mkt-section-header { max-width: var(--max-w); margin: 0 auto 4rem; }
        .mkt-section-header h2 {
          font-family: var(--serif); font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 300; line-height: 1.15; color: var(--text); margin-top: 1rem;
        }
        .mkt-steps {
          max-width: var(--max-w); margin: 0 auto;
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px;
        }
        .mkt-step { padding: 3rem 2.5rem; background: var(--surface); position: relative; transition: background 0.3s; }
        .mkt-step:hover { background: #151515; }
        .mkt-step-number { font-family: var(--serif); font-size: 3.5rem; font-weight: 300; color: var(--text-dim); line-height: 1; margin-bottom: 2rem; }
        .mkt-step h3 { font-family: var(--serif); font-size: 1.375rem; font-weight: 400; color: var(--text); margin-bottom: 1rem; line-height: 1.3; }
        .mkt-step p { font-size: 0.875rem; font-weight: 300; line-height: 1.75; color: var(--text-muted); }
        .mkt-step-accent {
          position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
          background: var(--gold); transform: scaleX(0); transition: transform 0.3s var(--ease); transform-origin: left;
        }
        .mkt-step:hover .mkt-step-accent { transform: scaleX(1); }
        @media (max-width: 768px) { .mkt-steps { grid-template-columns: 1fr; } }

        /* ─── Showcase ────────────────────────────────────────── */
        .mkt-showcase { padding: 7rem var(--gutter); text-align: center; overflow: hidden; }
        .mkt-showcase-inner { max-width: 1080px; margin: 0 auto; }
        .mkt-showcase-inner h2 { font-family: var(--serif); font-size: clamp(2rem, 4vw, 3rem); font-weight: 300; line-height: 1.15; margin-bottom: 1.25rem; }
        .mkt-showcase-inner h2 em { font-style: italic; color: var(--gold); }
        .mkt-showcase-desc { font-size: 0.9375rem; color: var(--text-muted); line-height: 1.75; max-width: 520px; margin: 0 auto 3.5rem; font-weight: 300; }
        .mkt-showcase-visual { position: relative; display: inline-block; width: 100%; }
        .mkt-showcase-visual img { width: 100%; height: auto; display: block; border-radius: 2px; }
        .mkt-callout {
          position: absolute; display: flex; align-items: center; gap: 0.45rem;
          background: rgba(8,8,8,0.88); border: 1px solid var(--gold-border);
          padding: 0.35em 0.75em 0.35em 0.6em; backdrop-filter: blur(6px); pointer-events: none; white-space: nowrap;
        }
        .mkt-callout-text { font-size: 0.5625rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); }
        .mkt-callout-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }
        .mkt-callout-1 { top: 18%; left:  4%; }
        .mkt-callout-2 { top:  5%; left: 34%; }
        .mkt-callout-3 { top:  5%; right: 24%; }
        .mkt-callout-4 { bottom: 22%; left: 38%; }
        .mkt-callout-5 { bottom: 22%; right: 6%; }
        .mkt-showcase-features {
          display: grid; grid-template-columns: repeat(5, 1fr);
          border: 1px solid var(--border); border-top: 1px solid var(--gold-border); margin-top: 0;
        }
        .mkt-showcase-feature { padding: 1.25rem 0.75rem; border-right: 1px solid var(--border); text-align: left; }
        .mkt-showcase-feature:last-child { border-right: none; }
        .mkt-sf-name { font-size: 0.625rem; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.3rem; }
        .mkt-sf-desc { font-size: 0.75rem; font-weight: 300; color: var(--text-muted); line-height: 1.5; }
        @media (max-width: 640px) {
          .mkt-callout { display: none; }
          .mkt-showcase-features { grid-template-columns: 1fr 1fr; }
          .mkt-showcase-feature:nth-child(2n) { border-right: none; }
        }

        /* ─── What You Receive ────────────────────────────────── */
        .mkt-receive {
          padding: 7rem var(--gutter); background: var(--surface);
          border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
        }
        .mkt-receive-intro {
          max-width: var(--max-w); margin: 0 auto 5rem;
          display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; align-items: start;
        }
        .mkt-receive-intro h2 { font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 300; line-height: 1.15; margin-top: 1rem; margin-bottom: 1.5rem; }
        .mkt-receive-intro p { font-size: 0.9375rem; font-weight: 300; line-height: 1.8; color: var(--text-muted); }
        .mkt-receive-note { font-size: 0.75rem; font-weight: 300; color: var(--text-dim); line-height: 1.6; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border); }
        .mkt-pricing-tiers { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; align-items: start; }
        .mkt-pricing-card { border: 1px solid var(--border); padding: 2.5rem; position: relative; display: flex; flex-direction: column; transition: border-color 0.3s var(--ease); }
        .mkt-pricing-card:hover { border-color: var(--gold-border); }
        .mkt-pricing-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: var(--border); transition: background 0.3s var(--ease); }
        .mkt-pricing-card:hover::before { background: linear-gradient(to right, var(--gold), transparent); }
        .mkt-pricing-card.featured { border-color: var(--gold-border); background: rgba(196,163,90,0.03); }
        .mkt-pricing-card.featured::before { background: linear-gradient(to right, var(--gold), transparent); }
        .mkt-pricing-label { font-size: 0.625rem; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: var(--gold); margin-bottom: 1.75rem; }
        .mkt-pricing-tier-name { font-family: var(--serif); font-size: 1.5rem; font-weight: 300; color: var(--text); margin-bottom: 0.375rem; line-height: 1; }
        .mkt-pricing-from { font-size: 0.6875rem; font-weight: 300; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 0.25rem; }
        .mkt-pricing-amount { font-family: var(--serif); font-size: clamp(2rem, 3.5vw, 3rem); font-weight: 300; color: var(--text); line-height: 1; margin-bottom: 0.25rem; }
        .mkt-pricing-tagline { font-size: 0.75rem; font-weight: 300; color: var(--text-muted); font-style: italic; margin-bottom: 1.75rem; padding-bottom: 1.75rem; border-bottom: 1px solid var(--border); }
        .mkt-pricing-features { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 2.5rem; flex: 1; }
        .mkt-pricing-features li { font-size: 0.8125rem; font-weight: 300; color: var(--text-soft); display: flex; align-items: flex-start; gap: 0.75rem; line-height: 1.5; }
        .mkt-pricing-features li::before { content: ''; display: block; width: 1.25rem; height: 1px; background: var(--gold); flex-shrink: 0; margin-top: 0.6em; }
        .mkt-pricing-features li strong { color: var(--text); font-weight: 400; display: block; margin-bottom: 0.125rem; }
        .mkt-pricing-features li em { font-size: 0.75rem; font-style: normal; color: var(--text-muted); }
        .mkt-pricing-badge { display: inline-block; font-size: 0.5625rem; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gold); border: 1px solid var(--gold-border); padding: 0.2em 0.6em; margin-left: 0.5rem; vertical-align: middle; position: relative; top: -0.1em; }
        @media (max-width: 900px) {
          .mkt-pricing-tiers { grid-template-columns: 1fr; max-width: 480px; }
          .mkt-receive-intro { grid-template-columns: 1fr; gap: 2rem; margin-bottom: 3rem; }
        }

        /* ─── CTA ─────────────────────────────────────────────── */
        .mkt-cta-section { padding: 10rem var(--gutter); text-align: center; position: relative; overflow: hidden; }
        .mkt-cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(196,163,90,0.04) 0%, transparent 65%); pointer-events: none; }
        .mkt-cta-section h2 { font-family: var(--serif); font-size: clamp(2rem, 5vw, 4rem); font-weight: 300; line-height: 1.15; max-width: 640px; margin: 0 auto 1.5rem; }
        .mkt-cta-section h2 em { font-style: italic; color: var(--gold); }
        .mkt-cta-section p { font-size: 0.9375rem; font-weight: 300; color: var(--text-muted); max-width: 400px; margin: 0 auto 3rem; line-height: 1.75; }

        /* ─── Footer ──────────────────────────────────────────── */
        .mkt-footer { padding: 4rem var(--gutter) 3rem; border-top: 1px solid var(--border); }
        .mkt-footer-inner { max-width: var(--max-w); margin: 0 auto; display: grid; grid-template-columns: 1fr auto; gap: 2rem; align-items: end; }
        .mkt-footer-brand { font-size: 0.7rem; font-weight: 500; letter-spacing: 0.25em; text-transform: uppercase; color: var(--text); margin-bottom: 0.75rem; }
        .mkt-footer-tagline { font-family: var(--serif); font-size: 0.875rem; font-style: italic; color: var(--text-muted); margin-bottom: 0.5rem; max-width: 400px; line-height: 1.6; }
        .mkt-footer-suite { font-size: 0.6875rem; font-weight: 300; color: var(--text-dim); letter-spacing: 0.05em; }
        .mkt-footer-links { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; text-align: right; }
        .mkt-footer-links a { font-size: 0.6875rem; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-muted); transition: color 0.2s; }
        .mkt-footer-links a:hover { color: var(--gold); }
        .mkt-footer-copy { max-width: var(--max-w); margin: 2.5rem auto 0; padding-top: 1.5rem; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .mkt-footer-copy span { font-size: 0.6875rem; font-weight: 300; color: var(--text-dim); }
        .mkt-footer-copy .mkt-arabic { color: var(--gold); font-size: 0.875rem; }
        @media (max-width: 640px) {
          .mkt-footer-inner { grid-template-columns: 1fr; }
          .mkt-footer-links { align-items: flex-start; text-align: left; }
        }

        /* ─── Fade-up animation ───────────────────────────────── */
        .mkt-fade-up { opacity: 0; transform: translateY(24px); transition: opacity 0.7s var(--ease), transform 0.7s var(--ease); }
        .mkt-fade-up.visible { opacity: 1; transform: translateY(0); }

        /* ─── Light mode ──────────────────────────────────────── */
        @media (prefers-color-scheme: light) {
          .mkt-root {
            --bg: #F5F0E8; --surface: #EDE8DF; --border: rgba(0,0,0,0.09);
            --gold: #8B6828; --gold-dim: rgba(139,104,40,0.10); --gold-border: rgba(139,104,40,0.28);
            --text: #1A1610; --text-muted: #6B6057; --text-soft: #4A4540; --text-dim: #B5AFA8;
          }
          #mkt-nav { background: rgba(245,240,232,0.97); border-color: rgba(0,0,0,0.07); }
          #mkt-nav.scrolled { background: rgba(245,240,232,0.99); }
          #mkt-nav-links.open { background: rgba(245,240,232,0.99); border-color: rgba(0,0,0,0.07); }
          .mkt-hero-overlay { background: linear-gradient(to bottom, rgba(20,16,10,0.55) 0%, rgba(20,16,10,0.3) 60%, rgba(245,240,232,0.15) 100%); }
          .mkt-callout { background: rgba(245,240,232,0.93); }
          .mkt-pricing-card { background: var(--surface); }
          .mkt-pricing-card.featured { background: rgba(139,104,40,0.06); }
          .mkt-btn-primary { background: var(--gold); color: var(--bg); border-color: var(--gold); }
          .mkt-footer { background: #EDE8DF; border-color: rgba(0,0,0,0.08); }
          .mkt-hero-content h1, .mkt-hero-content p, .mkt-hero-eyebrow { color: #F0EBE3; }
          .mkt-hero-content h1 em { color: #C4A35A; }
          .mkt-showcase { background: #0D0C0B; }
          .mkt-showcase-inner h2 { color: #F0EBE3; }
          .mkt-showcase-desc { color: rgba(240,235,227,0.6); }
        }
      `}</style>

      <div className="mkt-root">

        {/* ── Navigation ──────────────────────────────────── */}
        <nav id="mkt-nav">
          <a href="/" className="mkt-nav-logo">
            <span className="mkt-nav-logo-name">Oukala</span>
            <span className="mkt-nav-logo-product">Journeys</span>
          </a>
          <div id="mkt-nav-links">
            <a href="#philosophy">Our Philosophy</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#what-you-receive">What You Receive</a>
            <a href="/intake" className="mkt-btn">Begin Your Journey</a>
            <a href="/trip" className="mkt-nav-client">Client Portal →</a>
          </div>
          <button className="mkt-nav-toggle" id="mkt-nav-toggle" aria-label="Menu">
            <span /><span /><span />
          </button>
        </nav>

        {/* ── Hero ─────────────────────────────────────── */}
        <section className="mkt-hero">
          <div className="mkt-hero-bg">
            <div className="mkt-hero-slide mkt-hero-slide-1 active" />
            <div className="mkt-hero-slide mkt-hero-slide-2" />
            <div className="mkt-hero-slide mkt-hero-slide-3" />
            <div className="mkt-hero-slide mkt-hero-slide-4" />
            <div className="mkt-hero-slide mkt-hero-slide-5" />
          </div>
          <div className="mkt-hero-overlay" />
          <div className="mkt-hero-content">
            <div className="mkt-hero-eyebrow">Bespoke Travel · Designed for You</div>
            <h1>
              Every journey deserves a mind<br />
              that <em>knows you.</em>
            </h1>
            <p className="mkt-hero-sub">
              Oukala Journeys crafts bespoke travel itineraries built on deep
              familiarity — not templates. Tell us your vision.
              We take care of everything else.
            </p>
            <div className="mkt-hero-cta">
              <a href="/intake" className="mkt-btn mkt-btn-primary">Begin Your Journey</a>
              <a href="#how-it-works" className="mkt-btn">See How It Works</a>
            </div>
          </div>
          <div className="mkt-hero-scroll"><span>Scroll</span></div>
        </section>

        {/* ── Philosophy ───────────────────────────────── */}
        <section className="mkt-philosophy" id="philosophy">
          <div className="mkt-philosophy-inner">
            <div className="mkt-phil-rule" />
            <div className="mkt-philosophy-text mkt-fade-up">
              <div className="mkt-philosophy-arabic">وكالة</div>
              <p>
                Oukala comes from the Arabic for <strong>trust and agency</strong> —
                the idea that the best tool isn&apos;t just smart, it knows you.
                Every journey we design is built to act on your behalf,
                so living beautifully takes <strong>less effort and more joy.</strong>
              </p>
            </div>
            <div className="mkt-phil-rule right" />
          </div>
        </section>

        {/* ── How It Works ─────────────────────────────── */}
        <section className="mkt-how" id="how-it-works">
          <div className="mkt-container">
            <div className="mkt-section-header mkt-fade-up">
              <span className="mkt-eyebrow">The Process</span>
              <h2>Thoughtfully designed,<br />from the first conversation.</h2>
            </div>
          </div>
          <div className="mkt-steps">
            <div className="mkt-step mkt-fade-up">
              <div className="mkt-step-number">01</div>
              <h3>Tell us your vision</h3>
              <p>Share where you dream of going, how you like to travel, who&apos;s coming, and what would make it unforgettable. No brief too specific. No wish too ambitious.</p>
              <div className="mkt-step-accent" />
            </div>
            <div className="mkt-step mkt-fade-up" style={{ transitionDelay: '0.1s' }}>
              <div className="mkt-step-number">02</div>
              <h3>We craft your itinerary</h3>
              <p>We design a day-by-day itinerary built entirely around you — handpicked accommodations, curated experiences, and thoughtful logistics, delivered with the detail of someone who was there.</p>
              <div className="mkt-step-accent" />
            </div>
            <div className="mkt-step mkt-fade-up" style={{ transitionDelay: '0.2s' }}>
              <div className="mkt-step-number">03</div>
              <h3>You travel beautifully</h3>
              <p>Receive your itinerary, ask questions, request revisions. Then go — with the confidence that every detail has been considered by people who genuinely love to travel.</p>
              <div className="mkt-step-accent" />
            </div>
          </div>
        </section>

        {/* ── Itinerary Showcase ────────────────────────── */}
        <section className="mkt-showcase">
          <div className="mkt-showcase-inner">
            <span className="mkt-eyebrow mkt-fade-up" style={{ display: 'block', marginBottom: '1rem' }}>The Deliverable</span>
            <h2 className="mkt-fade-up">What you&apos;ll hold<br /><em>in your hands.</em></h2>
            <p className="mkt-showcase-desc mkt-fade-up">
              Every Oukala itinerary is a complete, beautifully produced travel document —
              not a PDF of links. Designed to be read before you board,
              referenced on the street, and kept long after you&apos;re home.
            </p>
            <div className="mkt-showcase-visual mkt-fade-up">
              <img src="/assets/itinerary-mockup.png" alt="An Oukala Journeys bespoke travel itinerary spread open" />
              <div className="mkt-callout mkt-callout-1"><div className="mkt-callout-dot" /><span className="mkt-callout-text">Traveler profile</span></div>
              <div className="mkt-callout mkt-callout-2"><div className="mkt-callout-dot" /><span className="mkt-callout-text">Day-by-day narrative</span></div>
              <div className="mkt-callout mkt-callout-3"><div className="mkt-callout-dot" /><span className="mkt-callout-text">Maps &amp; logistics</span></div>
              <div className="mkt-callout mkt-callout-4"><div className="mkt-callout-dot" /><span className="mkt-callout-text">Insider picks</span></div>
              <div className="mkt-callout mkt-callout-5"><div className="mkt-callout-dot" /><span className="mkt-callout-text">On-trip contacts</span></div>
              <div className="mkt-showcase-features">
                <div className="mkt-showcase-feature"><div className="mkt-sf-name">Traveler profile</div><div className="mkt-sf-desc">Preferences, pace &amp; party captured upfront</div></div>
                <div className="mkt-showcase-feature"><div className="mkt-sf-name">Day-by-day narrative</div><div className="mkt-sf-desc">Each day told as a story, not a spreadsheet</div></div>
                <div className="mkt-showcase-feature"><div className="mkt-sf-name">Maps &amp; logistics</div><div className="mkt-sf-desc">Transport, timing &amp; entry requirements</div></div>
                <div className="mkt-showcase-feature"><div className="mkt-sf-name">Insider picks</div><div className="mkt-sf-desc">Restaurants, experiences &amp; hidden gems</div></div>
                <div className="mkt-showcase-feature"><div className="mkt-sf-name">On-trip contacts</div><div className="mkt-sf-desc">Concierge, emergency lines &amp; local fixers</div></div>
              </div>
            </div>
          </div>
        </section>

        {/* ── What You Receive ──────────────────────────── */}
        <section className="mkt-receive" id="what-you-receive">
          <div className="mkt-receive-intro mkt-fade-up">
            <div>
              <span className="mkt-eyebrow">What You Receive</span>
              <h2>An itinerary as<br />considered as you are.</h2>
            </div>
            <div>
              <p>Every Oukala Journeys itinerary is a complete, bookable plan — not a list of suggestions. We go deep so you can arrive ready. Choose the level of guidance that suits your journey.</p>
              <p className="mkt-receive-note">Itinerary design fee only. Accommodations, flights, and experiences are separate and booked directly by you.</p>
            </div>
          </div>

          <div className="mkt-pricing-tiers">
            <div className="mkt-pricing-card mkt-fade-up">
              <div className="mkt-pricing-label">Essentials</div>
              <div className="mkt-pricing-tier-name">Essentials</div>
              <div className="mkt-pricing-from">Starting from</div>
              <div className="mkt-pricing-amount">$750</div>
              <div className="mkt-pricing-tagline">A complete itinerary, beautifully crafted.</div>
              <ul className="mkt-pricing-features">
                <li>Day-by-day itinerary document</li>
                <li>Accommodation recommendations with direct links</li>
                <li>Restaurant &amp; experience highlights</li>
                <li>Logistics overview &amp; local contacts</li>
                <li>One round of revisions</li>
              </ul>
              <a href="/intake?tier=essentials" className="mkt-btn mkt-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Begin Your Journey</a>
            </div>

            <div className="mkt-pricing-card featured mkt-fade-up" style={{ transitionDelay: '0.1s' }}>
              <div className="mkt-pricing-label">Signature <span className="mkt-pricing-badge">Most Popular</span></div>
              <div className="mkt-pricing-tier-name">Signature</div>
              <div className="mkt-pricing-from">Starting from</div>
              <div className="mkt-pricing-amount">$1,800</div>
              <div className="mkt-pricing-tagline">Your itinerary plus a human who knows it by heart.</div>
              <ul className="mkt-pricing-features">
                <li>Everything in Essentials</li>
                <li><strong>Dedicated travel advisor</strong><em>Your personal point of contact throughout planning</em></li>
                <li>In-depth local knowledge &amp; insider access</li>
                <li>Restaurant reservation guidance</li>
                <li>Extended logistics &amp; on-trip emergency contacts</li>
                <li>Two rounds of revisions</li>
              </ul>
              <a href="/intake?tier=signature" className="mkt-btn mkt-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Begin Your Journey</a>
            </div>

            <div className="mkt-pricing-card mkt-fade-up" style={{ transitionDelay: '0.2s' }}>
              <div className="mkt-pricing-label">Atelier</div>
              <div className="mkt-pricing-tier-name">Atelier</div>
              <div className="mkt-pricing-from">From</div>
              <div className="mkt-pricing-amount">$2,500<span style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>+</span></div>
              <div className="mkt-pricing-tagline">Weddings, celebrations &amp; grand journeys.</div>
              <ul className="mkt-pricing-features">
                <li>Everything in Signature</li>
                <li><strong>Full group &amp; event coordination</strong><em>Wedding parties, multi-family, milestone trips</em></li>
                <li>Multi-destination sequencing</li>
                <li>Bespoke presentation document</li>
                <li>On-trip support contact</li>
                <li>Unlimited revisions</li>
              </ul>
              <a href="/intake?tier=atelier" className="mkt-btn mkt-btn-outline" style={{ width: '100%', justifyContent: 'center' }}>Tell Us Your Vision</a>
            </div>
          </div>
        </section>

        {/* ── Final CTA ──────────────────────────────────── */}
        <section className="mkt-cta-section">
          <div className="mkt-fade-up">
            <span className="mkt-eyebrow">Ready?</span>
            <h2>Your next journey begins<br />with a <em>conversation.</em></h2>
            <p>Tell us where you want to go. We&apos;ll take it from there.</p>
            <a href="/intake" className="mkt-btn mkt-btn-primary">Begin Your Journey →</a>
          </div>
        </section>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="mkt-footer">
          <div className="mkt-footer-inner mkt-container">
            <div>
              <div className="mkt-footer-brand">Oukala Journeys</div>
              <div className="mkt-footer-tagline">&ldquo;The best tool isn&apos;t just smart — it knows you.&rdquo;</div>
              <div className="mkt-footer-suite">Part of the Oukala suite · Intelligent tools that act on your behalf</div>
            </div>
            <div className="mkt-footer-links">
              <a href="/intake">Begin Your Journey</a>
              <a href="#philosophy">Our Philosophy</a>
              <a href="mailto:hello@oukalajourney.com">Contact</a>
              <a href="/privacy">Privacy</a>
            </div>
          </div>
          <div className="mkt-footer-copy mkt-container">
            <span>© 2026 Oukala. All rights reserved.</span>
            <span className="mkt-arabic" title="wakāla — trust and agency">وكالة</span>
            <span>oukalajourney.com</span>
          </div>
        </footer>

      </div>
    </>
  )
}
