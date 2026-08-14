---
title: BotWhy — Voice Mode
date: 2026-07-06
duration: one day
tags: [BotWhy, Voice, Accessibility]
---

## What shipped

Voice input and voice replies for BotWhy's chat: a `useSpeechRecognition` hook for talking to the bot, a `useSpeechSynthesis` hook for hearing its replies read aloud, a tri-state `VoiceModeButton`, and a per-message read-aloud button (replacing an earlier auto-speak-everything approach).

## Why

A chat app is a natural fit for voice — both as an accessibility path and as a genuinely different way to use the product on mobile.

## How it's set up

Built on a dedicated `worktree-voice-mode` branch with its own design spec, merged as one unit. The auto-speak-every-reply approach shipped first and was replaced within the same day by a per-message button — auto-speaking every response turned out to be the wrong default, worth reversing quickly once it didn't feel right in practice.

## What's next

A follow-up refinement a few days later swapped in a more natural-sounding voice for the read-aloud playback, and added try/catch handling around speech input so a browser permission denial surfaces as a real error instead of failing silently.
