import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../core/services/zone.service';
import { Zone } from '../../core/models';

type ActionTab = 'lounge' | 'games' | 'vibe' | 'confess';

interface LoungeUser {
  id: string;
  name: string;
  avatarEmoji: string;
  gender: 'f' | 'm';
  ringColor: string;
  activityEmoji: string;
  nameStyle: 'pill' | 'text';
  nameColor: string;
  wx: number;
  wy: number;
  size: 'lg' | 'md' | 'sm';
  isMe: boolean;
  ring: 1 | 2 | 3;
}

interface ConfessionPost {
  id: string; avatarEmoji: string; timeAgo: string;
  text: string; revealed: boolean; mood: string;
}

interface LobbyCard {
  id: string; status: 'active' | 'waiting' | 'new'; statusLabel: string;
  title: string; players: number; maxPlayers: number;
  host?: string; isOpen?: boolean; startNote?: string;
  bgGradient: string; bgEmoji: string;
  action: 'join-match' | 'join-room' | 'register';
  svgCard?: boolean;
}

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="zone-root">

      <!-- ══ FULL-SCREEN MAP + WORLD ════════════════════════ -->
      <div class="lounge-viewport">

        <!-- 300%×300% scalable world — pannable via touch -->
        <div class="lounge-world"
          [style.transform]="worldTransform()"
          (touchstart)="onMapTouchStart($event)"
          (touchmove)="onMapTouchMove($event)"
          (touchend)="onMapTouchEnd($event)">

          <!-- Map / background layer -->
          @if (selectedBg().type === 'map') {
            <img class="map-bg" src="assets/background_map.svg" alt="" aria-hidden="true"/>
          } @else if (selectedBg().type === 'color') {
            <div class="map-bg" [style.background]="selectedBg().value"></div>
          } @else if (selectedBg().type === 'gradient') {
            <div class="map-bg" [style.background]="selectedBg().value"></div>
          }

          @for (u of loungeUsers(); track u.id) {
            <div class="avatar-node"
              [class]="'size-' + u.size"
              [style.left]="u.wx + '%'"
              [style.top]="u.wy + '%'"
              (click)="openProfile(u)">

              <div class="activity-float">
                @if (u.activityEmoji) { <span>{{ u.activityEmoji }}</span> }
                <span>{{ u.name }}</span>
              </div>

              <div class="avatar-frame" [class.me-frame]="u.isMe"
                [style.border-color]="u.ringColor"
                [style.box-shadow]="'0 0 0 4px ' + u.ringColor + '33, 0 0 18px ' + u.ringColor + '88, 0 0 36px ' + u.ringColor + '44'">
                <img class="avatar-img"
                  [src]="u.gender === 'f' ? 'assets/avatar_female.svg' : 'assets/avatar_male.svg'"
                  [alt]="u.name"/>
              </div>

            </div>
          }
        </div>

        <!-- ── Top bar: zone name left, member count + leave right ── -->
        <div class="map-top-bar">
          <div class="map-top-left">
            <div class="signal-icon">
              <span class="sig-ring sr-o"></span>
              <span class="sig-ring sr-m"></span>
              <span class="sig-dot"></span>
            </div>
            <h1 class="zone-title">{{ (zone()?.name || 'Neon Lounge') | uppercase }}</h1>
          </div>
          <div class="map-top-right">
            <div class="players-pill">
              <span class="pill-dot"></span>
              {{ playerCount() }} MEMBERS
            </div>
            <button class="leave-btn" (click)="leaveZone()">✕</button>
          </div>
        </div>

        <!-- ── Vibe badge pill (top left, below top bar) ── -->
        <div class="vibe-badge-pill">
          <span class="vibe-emoji-sm">{{ currentVibeEmoji }}</span>
          <span class="vibe-label-sm">{{ currentVibe }}</span>
        </div>

        <!-- ── EVENT ALERT card (top right, swipeable left) ── -->
        @if (showEventAlert()) {
          <div class="event-card"
            [style.transform]="'translateX(' + eventSwipeX() + 'px)'"
            [style.opacity]="eventCardOpacity()"
            (touchstart)="onEventTouchStart($event)"
            (touchmove)="onEventTouchMove($event)"
            (touchend)="onEventTouchEnd($event)">
            <div class="event-card-inner">
              <div class="event-top-row">
                <div class="event-alert-pill">
                  <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 9V7H20V9H16ZM17.2 16L14 13.6L15.2 12L18.4 14.4L17.2 16ZM15.2 4L14 2.4L17.2 0L18.4 1.6L15.2 4ZM3 15V11H2C1.45 11 0.979167 10.8042 0.5875 10.4125C0.195833 10.0208 0 9.55 0 9V7C0 6.45 0.195833 5.97917 0.5875 5.5875C0.979167 5.19583 1.45 5 2 5H6L11 2V14L6 11H5V15H3ZM12 11.35V4.65C12.45 5.05 12.8125 5.5375 13.0875 6.1125C13.3625 6.6875 13.5 7.31667 13.5 8C13.5 8.68333 13.3625 9.3125 13.0875 9.8875C12.8125 10.4625 12.45 10.95 12 11.35Z" fill="#AFA2FF"/>
                  </svg>
                  <svg width="68" height="16" viewBox="0 0 68 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.792 12V3.6H6.192V5.04H2.376V7.044H5.856V8.484H2.376V10.56H6.264V12H0.792ZM8.4 12L6.264 3.6H7.896L9.672 10.98H9.84L11.616 3.6H13.248L11.112 12H8.4ZM13.656 12V3.6H19.056V5.04H15.24V7.044H18.72V8.484H15.24V10.56H19.128V12H13.656ZM19.704 12V3.6H22.716L24.384 10.92H24.6V3.6H26.16V12H23.148L21.48 4.68H21.264V12H19.704ZM29.088 12V5.04H26.64V3.6H33.12V5.04H30.672V12H29.088ZM34.968 12L37.176 3.6H39.936L42.144 12H40.512L40.056 10.152H37.056L36.6 12H34.968ZM37.428 8.688H39.684L38.664 4.596H38.448L37.428 8.688ZM42.552 12V3.6H44.136V10.56H47.976V12H42.552ZM48.456 12V3.6H53.856V5.04H50.04V7.044H53.52V8.484H50.04V10.56H53.928V12H48.456ZM54.504 12V3.6H58.152C58.68 3.6 59.14 3.692 59.532 3.876C59.924 4.06 60.228 4.32 60.444 4.656C60.66 4.992 60.768 5.388 60.768 5.844V5.988C60.768 6.492 60.648 6.9 60.408 7.212C60.168 7.524 59.872 7.752 59.52 7.896V8.112C59.84 8.128 60.088 8.238 60.264 8.442C60.44 8.646 60.528 8.916 60.528 9.252V12H58.944V9.48C58.944 9.288 58.894 9.132 58.794 9.012C58.694 8.892 58.528 8.832 58.296 8.832H56.088V12H54.504ZM56.088 7.392H57.984C58.36 7.392 58.654 7.29 58.866 7.086C59.078 6.882 59.184 6.612 59.184 6.276V6.156C59.184 5.82 59.08 5.55 58.872 5.346C58.664 5.142 58.368 5.04 57.984 5.04H56.088V7.392ZM63.288 12V5.04H60.84V3.6H67.32V5.04H64.872V12H63.288Z" fill="white"/>
                  </svg>
                </div>
                <span class="event-timer">{{ eventTimer }}</span>
              </div>
              <p class="event-desc">Confession pit opening in {{ eventTimer }}. Drop your secrets.</p>
              <div class="event-swipe-hint">← swipe to dismiss</div>
            </div>
          </div>
        }

        <!-- ── Zoom controls (right side) ── -->
        <div class="zoom-controls">
          <button class="zoom-btn" (click)="adjustZoom(0.12)"
            [disabled]="zoomLevel() >= MAX_ZOOM">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1V13M1 7H13" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <div class="zoom-bar-track">
            <div class="zoom-bar-fill" [style.height]="zoomPercent() + '%'"></div>
          </div>
          <button class="zoom-btn" (click)="adjustZoom(-0.12)"
            [disabled]="zoomLevel() <= MIN_ZOOM">
            <svg width="14" height="4" viewBox="0 0 14 4" fill="none">
              <path d="M1 2H13" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <!-- Recenter button -->
          <button class="zoom-btn recenter-btn" (click)="recenterMap()">
            <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.29167 18.25V16.5833C6.55556 16.3889 5.06597 15.6701 3.82292 14.4271C2.57986 13.184 1.86111 11.6944 1.66667 9.95833H0V8.29167H1.66667C1.86111 6.55556 2.57986 5.06597 3.82292 3.82292C5.06597 2.57986 6.55556 1.86111 8.29167 1.66667V0H9.95833V1.66667C11.6944 1.86111 13.184 2.57986 14.4271 3.82292C15.6701 5.06597 16.3889 6.55556 16.5833 8.29167H18.25V9.95833H16.5833C16.3889 11.6944 15.6701 13.184 14.4271 14.4271C13.184 15.6701 11.6944 16.3889 9.95833 16.5833V18.25H8.29167ZM9.125 14.9583C10.7361 14.9583 12.1111 14.3889 13.25 13.25C14.3889 12.1111 14.9583 10.7361 14.9583 9.125C14.9583 7.51389 14.3889 6.13889 13.25 5C12.1111 3.86111 10.7361 3.29167 9.125 3.29167C7.51389 3.29167 6.13889 3.86111 5 5C3.86111 6.13889 3.29167 7.51389 3.29167 9.125C3.29167 10.7361 3.86111 12.1111 5 13.25C6.13889 14.3889 7.51389 14.9583 9.125 14.9583ZM9.125 12.4583C8.20833 12.4583 7.42361 12.1319 6.77083 11.4792C6.11806 10.8264 5.79167 10.0417 5.79167 9.125C5.79167 8.20833 6.11806 7.42361 6.77083 6.77083C7.42361 6.11806 8.20833 5.79167 9.125 5.79167C10.0417 5.79167 10.8264 6.11806 11.4792 6.77083C12.1319 7.42361 12.4583 8.20833 12.4583 9.125C12.4583 10.0417 12.1319 10.8264 11.4792 11.4792C10.8264 12.1319 10.0417 12.4583 9.125 12.4583ZM9.125 10.7917C9.58333 10.7917 9.97569 10.6285 10.3021 10.3021C10.6285 9.97569 10.7917 9.58333 10.7917 9.125C10.7917 8.66667 10.6285 8.27431 10.3021 7.94792C9.97569 7.62153 9.58333 7.45833 9.125 7.45833C8.66667 7.45833 8.27431 7.62153 7.94792 7.94792C7.62153 8.27431 7.45833 8.66667 7.45833 9.125C7.45833 9.58333 7.62153 9.97569 7.94792 10.3021C8.27431 10.6285 8.66667 10.7917 9.125 10.7917Z" fill="white"/>
            </svg>
          </button>

          <!-- Layer picker button -->
          <button class="zoom-btn layer-btn" [class.layer-active]="showLayerPicker()" (click)="showLayerPicker.set(!showLayerPicker())"  >
            <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 15.875L0 10.0417L1.375 9L7.5 13.75L13.625 9L15 10.0417L7.5 15.875ZM7.5 11.6667L0 5.83333L7.5 0L15 5.83333L7.5 11.6667ZM7.5 9.54167L12.2917 5.83333L7.5 2.125L2.70833 5.83333L7.5 9.54167Z"
                [attr.fill]="showLayerPicker() ? '#A78BFA' : 'rgba(255,255,255,0.5)'"/>
            </svg>
          </button>
        </div>

        <!-- ── Floating action buttons (bottom of map, above nav) ── -->
        <div class="floating-actions">
          <!-- GAMES -->
          <button class="fab-action" [class.fab-active]="activeAction() === 'games'"
            (click)="setAction('games')">
            <span class="fab-icon">
              <svg width="18" height="13" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.535 14C1.685 14 1.02667 13.7042 0.56 13.1125C0.0933333 12.5208 -0.0816667 11.8 0.035 10.95L1.085 3.45C1.235 2.45 1.68083 1.625 2.4225 0.975C3.16417 0.325 4.035 0 5.035 0H14.935C15.935 0 16.8058 0.325 17.5475 0.975C18.2892 1.625 18.735 2.45 18.885 3.45L19.935 10.95C20.0517 11.8 19.8767 12.5208 19.41 13.1125C18.9433 13.7042 18.285 14 17.435 14C17.085 14 16.76 13.9375 16.46 13.8125C16.16 13.6875 15.885 13.5 15.635 13.25L13.385 11H6.585L4.335 13.25C4.085 13.5 3.81 13.6875 3.51 13.8125C3.21 13.9375 2.885 14 2.535 14ZM2.935 11.85L5.785 9H14.185L17.035 11.85C17.0683 11.8833 17.2017 11.9333 17.435 12C17.6183 12 17.7642 11.9458 17.8725 11.8375C17.9808 11.7292 18.0183 11.5833 17.985 11.4L16.885 3.7C16.8183 3.21667 16.6017 2.8125 16.235 2.4875C15.8683 2.1625 15.435 2 14.935 2H5.035C4.535 2 4.10167 2.1625 3.735 2.4875C3.36833 2.8125 3.15167 3.21667 3.085 3.7L1.985 11.4C1.95167 11.5833 1.98917 11.7292 2.0975 11.8375C2.20583 11.9458 2.35167 12 2.535 12C2.56833 12 2.70167 11.95 2.935 11.85ZM14.985 8C15.2683 8 15.5058 7.90417 15.6975 7.7125C15.8892 7.52083 15.985 7.28333 15.985 7C15.985 6.71667 15.8892 6.47917 15.6975 6.2875C15.5058 6.09583 15.2683 6 14.985 6C14.7017 6 14.4642 6.09583 14.2725 6.2875C14.0808 6.47917 13.985 6.71667 13.985 7C13.985 7.28333 14.0808 7.52083 14.2725 7.7125C14.4642 7.90417 14.7017 8 14.985 8ZM12.985 5C13.2683 5 13.5058 4.90417 13.6975 4.7125C13.8892 4.52083 13.985 4.28333 13.985 4C13.985 3.71667 13.8892 3.47917 13.6975 3.2875C13.5058 3.09583 13.2683 3 12.985 3C12.7017 3 12.4642 3.09583 12.2725 3.2875C12.0808 3.47917 11.985 3.71667 11.985 4C11.985 4.28333 12.0808 4.52083 12.2725 4.7125C12.4642 4.90417 12.7017 5 12.985 5ZM5.735 8H7.235V6.25H8.985V4.75H7.235V3H5.735V4.75H3.985V6.25H5.735V8Z"
                  fill="white"/>
              </svg>
            </span>
            <span class="fab-label">GAMES</span>
          </button>

          <!-- TALK -->
          <button class="fab-action fab-talk" [class.fab-active]="activeAction() === 'vibe'"
            (click)="setAction('vibe')">
            <span class="fab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.477 2 2 6.477 2 12C2 13.89 2.525 15.655 3.435 17.165L2.05 21.95L6.835 20.565C8.345 21.475 10.11 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM8 13H7V11H8V13ZM12.5 13H11.5V11H12.5V13ZM17 13H16V11H17V13Z"
                  fill="white"/>
              </svg>
            </span>
            <span class="fab-label">TALK</span>
          </button>

          <!-- CONFESS -->
          <button class="fab-action" [class.fab-active]="activeAction() === 'confess'"
            (click)="setAction('confess')">
            <span class="fab-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1L15.09 8.26L23 9.27L17.5 14.64L18.18 22.63L12 19.27L5.82 22.63L6.5 14.64L1 9.27L8.91 8.26L12 1Z"
                  fill="white"/>
              </svg>
            </span>
            <span class="fab-label">CONFESS</span>
          </button>
        </div>

        <!-- ── Layer picker sheet ── -->
        @if (showLayerPicker()) {
          <div class="layer-backdrop" (click)="showLayerPicker.set(false)">
            <div class="layer-sheet" (click)="$event.stopPropagation()">
              <div class="layer-sheet-handle"></div>
              <div class="layer-sheet-title">Choose Background</div>
              <div class="layer-grid">
                @for (bg of bgOptions; track bg.id) {
                  <button class="layer-option"
                    [class.layer-option-active]="selectedBg().id === bg.id"
                    (click)="selectBg(bg)">
                    <div class="layer-preview"
                      [style.background]="bg.preview"
                      [style.border-color]="selectedBg().id === bg.id ? '#7B61FF' : 'rgba(255,255,255,0.1)'">
                      @if (bg.type === 'map') {
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M20.5 3L20.34 3.03L15 5.1L9 3L3.36 4.9C3.15 4.97 3 5.15 3 5.38V20.5C3 20.78 3.22 21 3.5 21L3.66 20.97L9 18.9L15 21L20.64 19.1C20.85 19.03 21 18.85 21 18.62V3.5C21 3.22 20.78 3 20.5 3ZM15 19L9 16.89V5L15 7.11V19Z" fill="rgba(255,255,255,0.6)"/>
                        </svg>
                      }
                    </div>
                    <span class="layer-name">{{ bg.name }}</span>
                    @if (selectedBg().id === bg.id) {
                      <span class="layer-check">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="8" fill="#7B61FF"/>
                          <path d="M5 8L7 10L11 6" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </span>
                    }
                  </button>
                }
              </div>
            </div>
          </div>
        }

      </div><!-- /lounge-viewport -->

      <!-- ══ CONFESS OVERLAY ══════════════════════════════════ -->
      @if (activeAction() === 'confess') {
        <div class="confess-overlay">
          <div class="confess-hdr">
            <div class="confess-hdr-left">
              <span class="lock-icon">🔒</span>
              <span class="confess-hdr-title">This stays in the zone 🤫</span>
            </div>
            <button class="confess-menu-btn" (click)="activeAction.set('lounge')">✕</button>
          </div>
          <div class="confess-body">
            <div class="privacy-shield">
              <span class="ps-label">PRIVACY SHIELD ACTIVE</span>
              <span class="ps-sub">No one outside can see this. Be real.</span>
            </div>
            <div class="confess-card">
              <textarea class="confess-ta" [(ngModel)]="confessText"
                placeholder="Say what you've been holding in..."
                rows="3" maxlength="500"></textarea>
              <div class="anon-row">
                <span class="anon-label">🔒 POST ANONYMOUSLY</span>
                <div class="toggle-wrap" (click)="confessAnon.set(!confessAnon())">
                  <div class="toggle-track" [class.on]="confessAnon()">
                    <div class="toggle-thumb"></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="mood-section">
              <div class="mood-label">HOW ARE YOU FEELING?</div>
              <div class="mood-chips">
                @for (m of moods; track m.key) {
                  <button class="mood-chip" [class.active]="selectedMood() === m.key"
                    (click)="selectedMood.set(m.key)">{{ m.emoji }} {{ m.label }}</button>
                }
              </div>
            </div>
            <button class="release-btn" [disabled]="!confessText.trim()"
              (click)="releaseConfession()">Release It 🔥</button>
            <div class="feed-hdr">
              <span class="feed-title">From this zone, right now</span>
              <span class="feed-live-dot"></span>
            </div>
            @for (post of confessionFeed(); track post.id) {
              <div class="cf-card">
                <div class="cf-top">
                  <span class="cf-avatar">{{ post.avatarEmoji }}</span>
                  <span class="cf-time">{{ post.timeAgo }}</span>
                </div>
                <div class="cf-content-wrap">
                  <p class="cf-text" [class.blurred]="!post.revealed">{{ post.text }}</p>
                  @if (!post.revealed) {
                    <button class="tap-to-read" (click)="revealPost(post)">TAP TO READ</button>
                  }
                </div>
              </div>
            }
            <div style="height:20px"></div>
          </div>
        </div>
      }

      <!-- ══ GAMES OVERLAY ════════════════════════════════════ -->
      @if (activeAction() === 'games') {
      <div class="games-overlay">
        <div class="games-hdr">
          <div class="games-hdr-left">
            <div class="live-pill-sm">
              <span class="live-dot-sm"></span>
              <span class="live-label-sm">LIVE LOBBY</span>
            </div>
            <span class="games-hdr-title">Games in This Zone</span>
          </div>
          <button class="games-up-btn" (click)="activeAction.set('lounge')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 4L4 12M12 4L20 12M12 4V20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="games-body">
          @for (card of lobbyCards(); track card.id) {
            <div class="g-card" [class.g-svg-card]="card.svgCard">
              @if (card.svgCard) {
                <div class="g-svg-wrap">
                  <div class="g-svg-bg"></div>
                  <button class="g-svg-btn" (click)="joinCard(card)"></button>
                </div>
              } @else {
                <div class="g-banner" [style.background]="card.bgGradient">
                  <span class="g-emoji">{{ card.bgEmoji }}</span>
                  <div class="g-badge" [class]="'g-badge-' + card.status">
                    @if (card.status === 'active') { <span class="g-dot"></span> }
                    {{ card.statusLabel }}
                  </div>
                </div>
                <div class="g-body">
                  <div class="g-title-row">
                    <span class="g-title">{{ card.title }}</span>
                    <span class="g-count">{{ card.players }}/{{ card.maxPlayers }}</span>
                  </div>
                  @if (card.host) {
                    <div class="g-host-row">
                      <span class="g-host-label">HOST</span>
                      <span class="g-host-name">{{ card.host }}</span>
                    </div>
                  }
                  @if (card.startNote) {
                    <div class="g-note-row">
                      @if (card.isOpen) { <span class="g-open-badge">OPEN</span> }
                      <span class="g-note">{{ card.startNote }}</span>
                    </div>
                  }
                  @if (card.action === 'join-match') {
                    <button class="g-btn g-btn-join" (click)="joinCard(card)">JOIN MATCH</button>
                  } @else if (card.action === 'join-room') {
                    <button class="g-btn g-btn-room" (click)="joinCard(card)">JOIN ROOM</button>
                  } @else {
                    <button class="g-btn g-btn-reg" (click)="joinCard(card)">REGISTER</button>
                  }
                </div>
              }
            </div>
          }
          <button class="g-create-btn">
            <span class="g-create-plus">+</span> Create Game
          </button>
          <div style="height:24px"></div>
        </div>
      </div>
      } <!-- /games-overlay -->

      <!-- ══ PROFILE PEEK SHEET ════════════════════════════════ -->
      @if (peekedUser()) {
        <div class="sheet-backdrop" (click)="peekedUser.set(null)">
          <div class="profile-sheet"
            (click)="$event.stopPropagation()"
            [style.transform]="sheetDragY() > 0 ? 'translateY(' + sheetDragY() + 'px)' : 'translateY(0)'"
            [style.transition]="sheetDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16,1,0.3,1)'"
            (touchstart)="onSheetTouchStart($event)"
            (touchmove)="onSheetTouchMove($event)"
            (touchend)="onSheetTouchEnd($event)">
            <div class="sheet-handle"></div>
            <div class="sheet-avatar"
              [style.border-color]="peekedUser()!.ringColor"
              [style.box-shadow]="'0 0 24px ' + peekedUser()!.ringColor + '88'">
              <img class="avatar-img"
                [src]="peekedUser()!.gender === 'f' ? 'assets/avatar_female.svg' : 'assets/avatar_male.svg'"
                [alt]="peekedUser()!.name"/>
            </div>
            <div class="sheet-name">{{ peekedUser()!.name }}</div>
            <div class="sheet-badge">{{ peekedUser()!.activityEmoji || '✨' }} Active now</div>
            <div class="sheet-actions">
              <button class="btn btn-primary">Connect 🤝</button>
              <button class="btn btn-ghost">Say hi 👋</button>
            </div>
          </div>
        </div>
      }

    </div>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }

    .zone-root {
      display: flex; flex-direction: column; flex: 1; min-height: 0;
      background: #090912; position: relative; overflow: hidden;
    }

    /* ══ LOUNGE VIEWPORT ═════════════════════════════════════ */
    .lounge-viewport {
      flex: 1; min-height: 0; position: relative; overflow: hidden;
    }

    .lounge-world {
      position: absolute;
      width: 300%; height: 300%;
      top: -100%; left: -100%;
      transform-origin: 50% 50%;
      transition: transform 0.35s cubic-bezier(0.34, 1.2, 0.64, 1);
      z-index: 1;
      will-change: transform;
      touch-action: none;
    }

    .map-bg {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; pointer-events: none; z-index: 0;
    }

    /* ── Avatar nodes ─────────────────────────────────────── */
    .avatar-node {
      position: absolute; display: flex; flex-direction: column;
      align-items: center; gap: 4px;
      transform: translate(-50%, -50%); cursor: pointer; z-index: 10;
      transition: transform 0.2s;
      &:active { transform: translate(-50%, -50%) scale(0.92); }
    }
    .size-lg .avatar-frame { width: min(86px, 20vw); height: min(86px, 20vw); }
    .size-md .avatar-frame { width: min(64px, 15vw); height: min(64px, 15vw); }
    .size-sm .avatar-frame { width: min(50px, 12vw); height: min(50px, 12vw); }
    .size-lg .avatar-inner  { font-size: min(42px, 10vw); }
    .size-md .avatar-inner  { font-size: min(30px, 7vw); }
    .size-sm .avatar-inner  { font-size: min(22px, 5.5vw); }

    .activity-float {
      font-size: min(13px, 3vw); font-weight: 700; letter-spacing: 0.5px;
      color: white; white-space: nowrap;
      background: rgba(20,16,40,0.82);
      border: 1px solid rgba(139,92,246,0.45);
      border-radius: 20px; padding: 3px 10px;
      backdrop-filter: blur(6px);
      margin-bottom: 4px;
    }
    .avatar-frame {
      border-radius: 50%;
      border: 3px solid #7c3aed;
      overflow: hidden;
      display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at 38% 36%, rgba(60,40,100,0.7), rgba(9,9,18,0.98) 80%);
      box-shadow:
        0 0 0 4px rgba(124,58,237,0.25),
        0 0 18px rgba(124,58,237,0.55),
        0 0 36px rgba(124,58,237,0.25);
      animation: avatar-appear 0.6s ease both;
    }
    .me-frame {
      border-color: #a78bfa !important;
      box-shadow:
        0 0 0 5px rgba(167,139,250,0.3),
        0 0 22px rgba(167,139,250,0.7),
        0 0 44px rgba(167,139,250,0.3) !important;
    }
    @keyframes avatar-appear{from{opacity:0;transform:scale(0.6)}to{opacity:1;transform:scale(1)}}
    .avatar-inner { line-height: 1; user-select: none; }
    .avatar-img {
      width: 100%; height: 100%;
      object-fit: cover; object-position: center top;
      border-radius: 50%;
      display: block;
      user-select: none; pointer-events: none;
    }

    /* ══ MAP TOP BAR ══════════════════════════════════════════ */
    .map-top-bar {
      position: absolute; top: 0; left: 0; right: 0; z-index: 20;
      display: flex; align-items: center; justify-content: space-between;
      padding: calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px;
      background: linear-gradient(to bottom, rgba(9,9,18,0.9) 0%, transparent 100%);
      backdrop-filter: blur(4px);
    }
    .map-top-left { display: flex; align-items: center; gap: 8px; }
    .map-top-right { display: flex; align-items: center; gap: 8px; }

    .signal-icon {
      position: relative; width: 22px; height: 22px;
      display: flex; align-items: center; justify-content: center;
    }
    .sig-ring {
      position: absolute; border-radius: 50%; border: 1.5px solid #a78bfa;
      animation: sig-pulse 2s ease-in-out infinite;
    }
    .sr-o { width: 20px; height: 20px; opacity: 0.3; animation-delay: 0s; }
    .sr-m { width: 13px; height: 13px; opacity: 0.55; animation-delay: 0.4s; }
    .sig-dot {
      position: absolute; width: 5px; height: 5px; border-radius: 50%;
      background: #a78bfa; box-shadow: 0 0 6px #a78bfa;
    }
    @keyframes sig-pulse {
      0%,100%{opacity:0.25;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.1)}
    }
    .zone-title {
      font-size: 14px; font-weight: 900; color: white; letter-spacing: 1.5px; margin: 0;
    }
    .players-pill {
      display: flex; align-items: center; gap: 5px;
      background: rgba(16,185,129,0.12); border: 1.5px solid rgba(16,185,129,0.35);
      border-radius: 20px; padding: 4px 10px; font-size: 10px; font-weight: 700;
      color: #10b981; letter-spacing: 0.5px;
    }
    .pill-dot {
      width: 6px; height: 6px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 6px #10b981; animation: pill-blink 1.5s infinite;
    }
    @keyframes pill-blink { 0%,100%{opacity:1}50%{opacity:0.4} }
    .leave-btn {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15);
      color: rgba(255,255,255,0.7); font-size: 12px; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
    }

    /* ══ VIBE BADGE PILL ══════════════════════════════════════ */
    .vibe-badge-pill {
      position: absolute; left: 16px; z-index: 20;
      top: calc(env(safe-area-inset-top, 0px) + 60px);
      display: flex; align-items: center; gap: 5px;
      background: rgba(123,97,255,0.18);
      border: 1px solid rgba(123,97,255,0.4);
      border-radius: 9999px; padding: 5px 12px;
      backdrop-filter: blur(8px);
    }
    .vibe-emoji-sm { font-size: 14px; }
    .vibe-label-sm {
      font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
      color: #C4B5FD;
    }

    /* ══ EVENT ALERT CARD ═════════════════════════════════════ */
    .event-card {
      position: absolute; right: 16px; z-index: 20;
      top: calc(env(safe-area-inset-top, 0px) + 60px);
      width: 200px;
      transition: transform 0.1s ease-out, opacity 0.1s ease-out;
      touch-action: pan-y;
    }
    .event-card-inner {
      width: 200px;
      min-height: 109.75px;
      background: rgba(29,29,55,0.40);
      border: 1px solid rgba(175,162,255,0.20);
      border-radius: 24px;
      padding: 14px 16px;
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-sizing: border-box;
    }
    .event-top-row {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 6px;
    }
    .event-alert-pill {
      display: flex; align-items: center; gap: 5px;
      font-size: 9px; font-weight: 800; letter-spacing: 1px;
      color: #FBB03B;
    }
    .event-alert-pill svg {
      flex-shrink: 0;
    }
    .event-timer {
      font-size: 12px; font-weight: 800; color: white; letter-spacing: 0.5px;
      font-family: 'Space Grotesk', sans-serif;
    }
    .event-desc {
      font-size: 11px; color: rgba(255,255,255,0.65); line-height: 1.5; margin: 0 0 6px;
    }
    .event-swipe-hint {
      font-size: 9px; color: rgba(255,255,255,0.25); text-align: right; letter-spacing: 0.5px;
    }

    /* ══ ZOOM CONTROLS ════════════════════════════════════════ */
    .zoom-controls {
      position: absolute; right: 14px; bottom: 220px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      z-index: 25;
    }
    .zoom-btn {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(20,18,40,0.85); border: 1.5px solid rgba(124,58,237,0.35);
      color: white; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(8px); transition: all 0.2s;
      &:not(:disabled):active {
        background: rgba(124,58,237,0.3); border-color: rgba(124,58,237,0.7);
        transform: scale(0.92);
      }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .zoom-bar-track {
      width: 4px; height: 44px; border-radius: 2px;
      background: rgba(255,255,255,0.1); overflow: hidden;
      display: flex; flex-direction: column-reverse;
    }
    .zoom-bar-fill {
      width: 100%; border-radius: 2px;
      background: linear-gradient(0deg, #7c3aed, #c4b5fd);
      transition: height 0.3s ease;
    }
    .recenter-btn {
      margin-top: 4px;
      border-color: rgba(167,139,250,0.4);
      width: 40px; height: 40px;
    }
    .recenter-btn:active {
      background: rgba(167,139,250,0.2);
      border-color: rgba(167,139,250,0.7);
    }
    .layer-btn {
      margin-top: 4px;
      width: 40px; height: 40px;
      transition: all 0.2s;
    }
    .layer-btn.layer-active {
      border-color: rgba(167,139,250,0.5);
      background: rgba(167,139,250,0.15);
    }
    .layer-btn:active {
      background: rgba(167,139,250,0.2);
    }

    /* ══ LAYER PICKER SHEET ═══════════════════════════════════ */
    .layer-backdrop {
      position: absolute; inset: 0; z-index: 35;
      background: rgba(0,0,0,0.5);
      display: flex; align-items: flex-end;
      animation: fade-in 0.2s ease;
    }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }

    .layer-sheet {
      width: 100%;
      background: rgba(13,11,30,0.96);
      border: 1px solid rgba(255,255,255,0.08);
      border-bottom: none;
      border-radius: 28px 28px 0 0;
      padding: 12px 20px calc(130px + env(safe-area-inset-bottom, 0px));
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      animation: slide-up 0.28s cubic-bezier(0.16,1,0.3,1) both;
    }
    @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }

    .layer-sheet-handle {
      width: 36px; height: 4px; border-radius: 2px;
      background: rgba(255,255,255,0.15);
      margin: 0 auto 16px;
    }
    .layer-sheet-title {
      font-size: 13px; font-weight: 800; letter-spacing: 1.5px;
      color: rgba(255,255,255,0.4); text-align: center;
      margin-bottom: 16px; text-transform: uppercase;
    }
    .layer-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .layer-option {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      background: none; border: none; cursor: pointer; padding: 0;
      position: relative;
    }
    .layer-preview {
      width: 100%; aspect-ratio: 1;
      border-radius: 16px;
      border: 2px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      transition: border-color 0.2s, box-shadow 0.2s;
      overflow: hidden;
    }
    .layer-option-active .layer-preview {
      box-shadow: 0 0 0 2px #7B61FF, 0 0 16px rgba(123,97,255,0.4);
    }
    .layer-name {
      font-size: 11px; font-weight: 600;
      color: rgba(255,255,255,0.6);
      letter-spacing: 0.3px;
    }
    .layer-option-active .layer-name { color: #A78BFA; }
    .layer-check {
      position: absolute; top: 6px; right: 6px;
    }

    /* ══ FLOATING ACTION BUTTONS ══════════════════════════════ */
    .floating-actions {
      position: absolute; bottom: 120px; left: 0; right: 0; z-index: 25;
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 0 24px;
    }

    .fab-action {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 109.33px; height: 56px;
      padding: 0 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.10);
      border-radius: 9999px;
      color: white; cursor: pointer;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.37);
      transition: all 0.2s;
      flex-shrink: 0;
      &:active { transform: scale(0.95); }
      &.fab-active {
        background: rgba(123,97,255,0.2);
        border-color: rgba(123,97,255,0.4);
        box-shadow: 0 8px 32px rgba(0,0,0,0.37), 0 0 16px rgba(123,97,255,0.25);
      }
    }

    .fab-talk {
      background: rgba(255,255,255,0.03);
      border-color: rgba(255,255,255,0.10);
    }

    .fab-icon {
      display: flex; align-items: center; justify-content: center;
    }

    .fab-label {
      font-size: 11px; font-weight: 800; letter-spacing: 1px; color: white;
    }

    /* ══ CONFESS OVERLAY ══════════════════════════════════════ */
    .confess-overlay {
      position: absolute; inset: 0; z-index: 40; background: #0d0b1e;
      display: flex; flex-direction: column;
      animation: slide-up 0.32s cubic-bezier(0.16,1,0.3,1) both;
    }
    @keyframes slide-up{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}
    .confess-hdr {
      flex-shrink:0; display:flex; align-items:center; justify-content:space-between;
      padding:14px 18px; background:rgba(18,15,38,0.95);
      border-bottom:1px solid rgba(255,255,255,0.06);
    }
    .confess-hdr-left{display:flex;align-items:center;gap:10px;}
    .lock-icon{font-size:18px}
    .confess-hdr-title{font-size:14px;font-weight:700;color:white}
    .confess-menu-btn{
      width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,0.08);
      border:none;color:rgba(255,255,255,0.6);font-size:14px;cursor:pointer;
    }
    .confess-body{
      flex:1;min-height:0;overflow-y:auto;padding:12px 16px;scrollbar-width:none;
      display:flex;flex-direction:column;gap:10px;align-items:stretch;
      &::-webkit-scrollbar{display:none}
    }
    .privacy-shield{display:flex;flex-direction:column;gap:3px;flex-shrink:0}
    .ps-label{font-size:11px;font-weight:800;letter-spacing:1px;color:#f59e0b}
    .ps-sub{font-size:13px;color:rgba(255,255,255,0.45)}
    .privacy-shield::after{
      content:''; display:block; height:1px;
      background:rgba(255,255,255,0.08); margin-top:10px;
    }
    .confess-card{
      flex-shrink:0;
      background:rgba(22,18,45,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;
    }
    .confess-ta{
      display:block; width:100%; height:110px;
      padding:14px 16px;resize:none;
      border:none;outline:none;
      background:transparent;color:white;font-size:14px;line-height:1.6;
      font-family:inherit;box-sizing:border-box;overflow-y:auto;
      &::placeholder{color:rgba(255,255,255,0.25)}
    }
    .anon-row{
      display:flex;align-items:center;justify-content:space-between;
      padding:11px 16px;border-top:1px solid rgba(255,255,255,0.06);
    }
    .anon-label{font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);letter-spacing:0.5px}
    .toggle-wrap{cursor:pointer}
    .toggle-track{
      width:44px;height:26px;border-radius:13px;background:rgba(255,255,255,0.12);
      position:relative;transition:background 0.25s;
      &.on{background:#10b981}
    }
    .toggle-thumb{
      position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;
      background:white;transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    }
    .toggle-track.on .toggle-thumb{transform:translateX(18px)}
    .mood-section{display:flex;flex-direction:column;gap:10px;flex-shrink:0}
    .mood-label{font-size:11px;font-weight:800;letter-spacing:1px;color:rgba(255,255,255,0.35)}
    .mood-chips{display:flex;gap:6px;flex-wrap:wrap}
    .mood-chip{
      padding:6px 11px;border-radius:20px;font-size:12px;font-weight:600;
      background:rgba(255,255,255,0.05);border:1.5px solid rgba(255,255,255,0.1);
      color:rgba(255,255,255,0.5);cursor:pointer;transition:all 0.2s;
      &.active{background:rgba(124,58,237,0.2);border-color:#8b5cf6;color:white}
    }
    .release-btn{
      flex-shrink:0;width:100%;padding:13px;border-radius:16px;border:none;
      background:linear-gradient(90deg,#7c3aed 0%,#a855f7 40%,#f97316 100%);
      color:white;font-size:16px;font-weight:800;cursor:pointer;
      box-shadow:0 4px 24px rgba(124,58,237,0.4);transition:opacity 0.2s,transform 0.15s;
      &:disabled{opacity:0.3;cursor:default}
      &:not(:disabled):active{transform:scale(0.98)}
    }
    .feed-hdr{display:flex;align-items:center;justify-content:space-between;padding:4px 0 2px;flex-shrink:0}
    .feed-title{font-size:15px;font-weight:800;color:white}
    .feed-live-dot{
      width:9px;height:9px;border-radius:50%;background:#10b981;
      box-shadow:0 0 8px #10b981;animation:pill-blink 1.5s infinite;
    }
    .cf-card{
      background:rgba(18,15,38,0.7);border:1px solid rgba(255,255,255,0.07);
      border-radius:14px;padding:14px;display:flex;flex-direction:column;gap:10px;
    }
    .cf-top{display:flex;align-items:center;justify-content:space-between}
    .cf-avatar{font-size:22px} .cf-time{font-size:11px;color:rgba(255,255,255,0.3)}
    .cf-content-wrap{position:relative}
    .cf-text{
      font-size:13px;color:rgba(255,255,255,0.75);line-height:1.6;margin:0;
      transition:filter 0.4s;
      &.blurred{filter:blur(5px);user-select:none}
    }
    .tap-to-read{
      position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
      background:rgba(30,25,55,0.88);border:1px solid rgba(255,255,255,0.15);
      border-radius:20px;padding:7px 18px;font-size:12px;font-weight:700;
      color:white;cursor:pointer;white-space:nowrap;backdrop-filter:blur(6px);letter-spacing:0.5px;
    }

    /* ══ PROFILE SHEET ════════════════════════════════════════ */
    .sheet-backdrop{
      position:absolute;inset:0;background:rgba(0,0,0,0.65);
      display:flex;align-items:flex-end;z-index:50;
    }
    .profile-sheet{
      width:100%;background:rgba(18,15,38,0.98);border-radius:24px 24px 0 0;
      border-top:1px solid rgba(124,58,237,0.3);
      padding:16px 28px calc(120px + env(safe-area-inset-bottom, 0px));
      display:flex;flex-direction:column;align-items:center;gap:12px;
    }
    .sheet-handle{width:36px;height:4px;border-radius:2px;background:rgba(255,255,255,0.15);margin-bottom:8px}
    .sheet-avatar{
      width:80px;height:80px;border-radius:50%;border:2.5px solid;font-size:42px;
      display:flex;align-items:center;justify-content:center;
      background:radial-gradient(circle at 38% 36%,rgba(80,50,120,0.5),rgba(9,9,18,0.95) 75%);
    }
    .sheet-name{font-size:18px;font-weight:800;color:white;letter-spacing:0.5px}
    .sheet-badge{
      font-size:12px;color:rgba(255,255,255,0.5);font-weight:600;
      background:rgba(124,58,237,0.12);border:1px solid rgba(124,58,237,0.25);
      border-radius:20px;padding:4px 14px;
    }
    .sheet-actions{display:flex;gap:12px;margin-top:8px;width:100%}
    .sheet-actions .btn{flex:1}

    /* ══ GAMES OVERLAY ════════════════════════════════════════ */
    .games-overlay {
      position: absolute; inset: 0; z-index: 40;
      background: #0d0b1e;
      display: flex; flex-direction: column;
      animation: slide-up 0.32s cubic-bezier(0.16,1,0.3,1) both;
    }
    .games-hdr {
      flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
      padding: 14px 18px; background: rgba(18,15,38,0.95);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .games-hdr-left { display: flex; flex-direction: column; gap: 2px; }
    .live-pill-sm { display: flex; align-items: center; gap: 5px; }
    .live-dot-sm {
      width: 6px; height: 6px; border-radius: 50%;
      background: #22C55E; box-shadow: 0 0 6px #22C55E;
      animation: pill-blink 1.4s infinite;
    }
    .live-label-sm { font-size: 9px; font-weight: 700; letter-spacing: 1.2px; color: #22C55E; }
    .games-hdr-title { font-size: 15px; font-weight: 700; color: white; }
    .games-up-btn {
      width: 34px; height: 34px; border-radius: 50%;
      background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center; cursor: pointer;
    }
    .games-body {
      flex: 1; min-height: 0; overflow-y: auto;
      padding: 14px 16px;
      display: flex; flex-direction: column; gap: 14px;
      scrollbar-width: none;
      &::-webkit-scrollbar { display: none; }
    }
    .g-create-btn {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      width: 100%; padding: 14px;
      background: #12112A; border: 1px solid rgba(255,255,255,0.12);
      border-radius: 16px; color: white;
      font-size: 14px; font-weight: 700; cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .g-create-plus { font-size: 18px; font-weight: 400; }

    /* game cards */
    .g-card {
      border-radius: 16px; overflow: hidden;
      background: #12112A; border: 1px solid rgba(255,255,255,0.07);
    }
    .g-svg-card { background: transparent; border: none; overflow: visible; }
    .g-svg-wrap { position: relative; border-radius: 16px; overflow: hidden; }
    .g-svg-bg {
      width: 100%; aspect-ratio: 342 / 390;
      background-image: url('../../../assets/ludo.svg');
      background-size: 100% 100%; background-repeat: no-repeat;
    }
    .g-svg-btn {
      position: absolute; bottom: 0; left: 0; right: 0; height: 68px;
      background: transparent; border: none; cursor: pointer;
    }
    .g-banner {
      position: relative; height: 130px;
      display: flex; align-items: center; justify-content: center; overflow: hidden;
    }
    .g-emoji { font-size: 70px; opacity: 0.5; }
    .g-badge {
      position: absolute; top: 10px; left: 10px;
      display: flex; align-items: center; gap: 4px;
      border-radius: 20px; padding: 3px 9px;
      font-size: 9px; font-weight: 800; letter-spacing: 1px;
    }
    .g-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; animation: pill-blink 1.4s infinite; }
    .g-badge-active  { background: rgba(34,197,94,0.15);  color: #22C55E; border: 1px solid rgba(34,197,94,0.3); }
    .g-badge-waiting { background: rgba(251,191,36,0.15); color: #FBBF24; border: 1px solid rgba(251,191,36,0.3); }
    .g-badge-new     { background: rgba(255,110,132,0.15);color: #FF6E84; border: 1px solid rgba(255,110,132,0.3); }
    .g-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 8px; }
    .g-title-row { display: flex; align-items: center; justify-content: space-between; }
    .g-title { font-size: 15px; font-weight: 700; color: white; }
    .g-count { font-size: 11px; color: #AAA8C3; font-weight: 600; }
    .g-host-row { display: flex; align-items: center; gap: 6px; }
    .g-host-label { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: #AAA8C3; }
    .g-host-name { font-size: 12px; font-weight: 600; color: white; }
    .g-note-row { display: flex; align-items: center; gap: 6px; }
    .g-open-badge { font-size: 9px; font-weight: 800; letter-spacing: 1px; color: #22C55E; border: 1px solid #22C55E; border-radius: 4px; padding: 2px 5px; }
    .g-note { font-size: 11px; color: #AAA8C3; }
    .g-btn {
      width: 100%; border-radius: 10px; padding: 11px;
      font-size: 11px; font-weight: 800; letter-spacing: 1px;
      cursor: pointer; border: none; &:active { transform: scale(0.97); }
    }
    .g-btn-join { background: linear-gradient(135deg,#7B61FF,#5B21B6); color: white; box-shadow: 0 4px 14px rgba(123,97,255,0.35); }
    .g-btn-room { background: rgba(255,255,255,0.06); color: white; border: 1px solid rgba(255,255,255,0.12) !important; }
    .g-btn-reg  { background: transparent; color: #22C55E; border: 1.5px solid #22C55E !important; }

    /* shared btn styles */
    .btn {
      padding: 12px 16px; border-radius: 12px; border: none;
      font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .btn-primary {
      background: linear-gradient(135deg, #7c3aed, #5b21b6); color: white;
      box-shadow: 0 4px 16px rgba(124,58,237,0.4);
    }
    .btn-ghost {
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: white;
    }
  `]
})
export class ZoneComponent implements OnInit, OnDestroy {

  readonly MIN_ZOOM = 0.35;
  readonly MAX_ZOOM = 1.05;

  zone         = signal<Zone | null>(null);
  peekedUser   = signal<LoungeUser | null>(null);
  activeAction = signal<ActionTab>('lounge');
  playerCount  = signal(42);
  zoomLevel    = signal(0.65);

  zoomPercent = computed(() => {
    const range = this.MAX_ZOOM - this.MIN_ZOOM;
    return Math.round(((this.zoomLevel() - this.MIN_ZOOM) / range) * 100);
  });

  /* ── Pan state ─────────────────────────────────────── */
  panX = signal(0);
  panY = signal(0);
  private mapPanning = false;
  private mapPanStartX = 0;
  private mapPanStartY = 0;
  private mapPanOriginX = 0;
  private mapPanOriginY = 0;

  /**
   * The world div is 300% × 300% of the viewport, centred via top:-100% left:-100%.
   * After scaling by `zoomLevel`, the visible half-width of the world (in screen px) is:
   *   halfWorld = viewportW * 1.5 * zoom
   * The viewport half-width is viewportW * 0.5.
   * Maximum pan before the edge of the world hits the edge of the viewport:
   *   maxPan = halfWorld - halfViewport = viewportW * (1.5 * zoom - 0.5)
   * We apply this clamping live so it tightens when zoomed out and relaxes when zoomed in.
   */
  private viewportEl: HTMLElement | null = null;

  private get maxPan(): { x: number; y: number } {
    // Use the actual lounge-viewport element size, not window size,
    // because the nav bar reduces the available height.
    const el = this.viewportEl ?? document.querySelector('.lounge-viewport') as HTMLElement;
    if (el) this.viewportEl = el;
    const vw = el ? el.clientWidth  : window.innerWidth;
    const vh = el ? el.clientHeight : window.innerHeight;
    const z  = this.zoomLevel();
    // World div = 300% × 300% of the lounge-viewport, centred via top:-100% left:-100%.
    // After scale(z): world half-width in screen px = 1.5 * z * vw
    // Viewport half-width in screen px               = 0.5 * vw
    // Max pan before edge of world aligns with edge of viewport:
    //   maxPan = (1.5z - 0.5) * vw
    const mx = Math.max(0, (1.5 * z - 0.5) * vw);
    const my = Math.max(0, (1.5 * z - 0.5) * vh);
    return { x: mx, y: my };
  }

  private clampPan(x: number, y: number): { x: number; y: number } {
    const { x: mx, y: my } = this.maxPan;
    return {
      x: Math.max(-mx, Math.min(mx, x)),
      y: Math.max(-my, Math.min(my, y)),
    };
  }

  worldTransform = computed(() => {
    const scale = this.zoomLevel();
    const tx = this.panX();
    const ty = this.panY();
    // translate() is in the element's pre-scale coordinate space.
    // screen displacement = translate_val * scale, so to get tx screen px: tx / scale.
    // BUT transform-origin is 50%/50% of the world div (which is 300%×300%),
    // so we use translateX in world coords = panX / scale.
    return `scale(${scale}) translate(${tx / scale}px, ${ty / scale}px)`;
  });

  /* ── Pinch-to-zoom state ───────────────────────────── */
  private pinching = false;
  private pinchStartDist = 0;
  private pinchStartZoom = 0;

  private getTouchDist(e: TouchEvent): number {
    const dx = e.touches[0].clientX - e.touches[1].clientX;
    const dy = e.touches[0].clientY - e.touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  onMapTouchStart(e: TouchEvent) {
    if (e.touches.length === 2) {
      // Pinch start
      this.pinching = true;
      this.mapPanning = false;
      this.pinchStartDist = this.getTouchDist(e);
      this.pinchStartZoom = this.zoomLevel();
      return;
    }
    // Only start pan if not touching an avatar node
    if ((e.target as HTMLElement).closest('.avatar-node')) return;
    if (e.touches.length !== 1) return;
    this.pinching = false;
    this.mapPanning = true;
    this.mapPanStartX = e.touches[0].clientX;
    this.mapPanStartY = e.touches[0].clientY;
    this.mapPanOriginX = this.panX();
    this.mapPanOriginY = this.panY();
  }
  onMapTouchMove(e: TouchEvent) {
    if (e.touches.length === 2 && this.pinching) {
      e.preventDefault();
      const dist = this.getTouchDist(e);
      const ratio = dist / this.pinchStartDist;
      const next = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM,
        Math.round(this.pinchStartZoom * ratio * 100) / 100));
      this.zoomLevel.set(next);
      // Re-clamp pan to new zoom bounds
      const clamped = this.clampPan(this.panX(), this.panY());
      this.panX.set(clamped.x);
      this.panY.set(clamped.y);
      return;
    }
    if (!this.mapPanning || e.touches.length !== 1) return;
    e.preventDefault();
    const dx = e.touches[0].clientX - this.mapPanStartX;
    const dy = e.touches[0].clientY - this.mapPanStartY;
    const clamped = this.clampPan(this.mapPanOriginX + dx, this.mapPanOriginY + dy);
    this.panX.set(clamped.x);
    this.panY.set(clamped.y);
  }
  onMapTouchEnd(e: TouchEvent) {
    if (e.touches.length < 2) this.pinching = false;
    if (e.touches.length === 0) this.mapPanning = false;
  }

  recenterMap() {
    this.panX.set(0);
    this.panY.set(0);
  }

  /* ── Layer picker ──────────────────────────────────── */
  showLayerPicker = signal(false);

  bgOptions = [
    { id: 'map',       name: 'City Map',     type: 'map',      value: '',                                                                          preview: '#1a1a2e' },
    { id: 'none',      name: 'Dark',         type: 'color',    value: '#090912',                                                                   preview: '#090912' },
    { id: 'midnight',  name: 'Midnight',     type: 'gradient', value: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)',                           preview: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
    { id: 'aurora',    name: 'Aurora',       type: 'gradient', value: 'linear-gradient(135deg,#0a0a14 0%,#1a0a2e 40%,#0a1a2e 100%)',              preview: 'linear-gradient(135deg,#0a0a14,#1a0a2e,#0a1a2e)' },
    { id: 'neon',      name: 'Neon City',    type: 'gradient', value: 'linear-gradient(160deg,#0d0221 0%,#1b1033 50%,#0d1b2a 100%)',              preview: 'linear-gradient(160deg,#0d0221,#1b1033,#0d1b2a)' },
    { id: 'forest',    name: 'Forest',       type: 'gradient', value: 'linear-gradient(135deg,#0a1a0a 0%,#0d2b1a 50%,#0a0d14 100%)',              preview: 'linear-gradient(135deg,#0a1a0a,#0d2b1a,#0a0d14)' },
  ];

  selectedBg = signal(this.bgOptions[0]);

  selectBg(bg: typeof this.bgOptions[0]) {
    this.selectedBg.set(bg);
    this.showLayerPicker.set(false);
  }

  /* ── Event alert swipe state ─────────────────────────── */
  showEventAlert = signal(true);
  eventSwipeX    = signal(0);
  eventCardOpacity = computed(() => {
    const x = this.eventSwipeX();
    if (x >= 0) return 1;
    return Math.max(0, 1 + x / 120);
  });

  private swipeTouchStartX = 0;
  private swipeTouchCurrentX = 0;

  /* ── Profile sheet swipe-down-to-close ──────────────── */
  sheetDragY    = signal(0);
  sheetDragging = false;
  private sheetTouchStartY = 0;

  onSheetTouchStart(e: TouchEvent) {
    this.sheetTouchStartY = e.touches[0].clientY;
    this.sheetDragging = true;
  }
  onSheetTouchMove(e: TouchEvent) {
    const delta = e.touches[0].clientY - this.sheetTouchStartY;
    if (delta > 0) {
      e.stopPropagation();
      this.sheetDragY.set(delta);
    }
  }
  onSheetTouchEnd(_e: TouchEvent) {
    this.sheetDragging = false;
    if (this.sheetDragY() > 80) {
      this.peekedUser.set(null);
    }
    this.sheetDragY.set(0);
  }

  onEventTouchStart(e: TouchEvent) {
    this.swipeTouchStartX = e.touches[0].clientX;
  }
  onEventTouchMove(e: TouchEvent) {
    const delta = e.touches[0].clientX - this.swipeTouchStartX;
    if (delta < 0) this.eventSwipeX.set(delta);
  }
  onEventTouchEnd(_e: TouchEvent) {
    if (this.eventSwipeX() < -80) {
      this.showEventAlert.set(false);
      this.eventSwipeX.set(0);
    } else {
      this.eventSwipeX.set(0);
    }
  }

  /* ── Event timer ─────────────────────────────────────── */
  eventTimer = '04:22';
  private timerInterval?: ReturnType<typeof setInterval>;
  private timerSeconds = 4 * 60 + 22;

  /* ── Vibe from route ─────────────────────────────────── */
  currentVibe = 'CHILL';
  currentVibeEmoji = '😌';
  private vibeEmojiMap: Record<string, string> = {
    'hyped': '🔥', 'chill': '😌', 'lonely': '💜',
    'lets-play': '🎮', 'need-to-talk': '🗣️', 'just-vibing': '👻'
  };

  /* ── Confess state ─────────────────────────────────────── */
  confessText  = '';
  confessAnon  = signal(true);
  selectedMood = signal('heartbroken');
  moods = [
    { key: 'frustrated',  emoji: '😤', label: 'Frustrated' },
    { key: 'heartbroken', emoji: '💔', label: 'Heartbroken' },
    { key: 'overwhelmed', emoji: '😮‍💨', label: 'Overwhelm' },
    { key: 'lonely',      emoji: '🌙', label: 'Lonely' },
    { key: 'anxious',     emoji: '😰', label: 'Anxious' }
  ];
  confessionFeed = signal<ConfessionPost[]>([
    { id:'c1', avatarEmoji:'🦊', timeAgo:'2m ago',  revealed:false, mood:'frustrated',
      text:"I can't stop thinking about someone I met here last week. We talked for hours but I didn't get their contact. Came back every day hoping to see them again." },
    { id:'c2', avatarEmoji:'🙏', timeAgo:'12m ago', revealed:false, mood:'heartbroken',
      text:"Actually the reason I'm always here working late is because going home feels empty. I keep smiling because I don't want to be a burden." },
    { id:'c3', avatarEmoji:'🌻', timeAgo:'31m ago', revealed:false, mood:'overwhelmed',
      text:"I quit my job today without a backup plan. Terrified but also weirdly free? Told no one. You're the first to know." }
  ]);

  /* ── Lounge users ──────────────────────────────────────── */
  loungeUsers = signal<LoungeUser[]>([
    { id:'me', name:'NOVA_STREAM', avatarEmoji:'', gender:'f', ringColor:'#c084fc',
      activityEmoji:'', nameStyle:'pill', nameColor:'white',
      wx:50, wy:50, size:'lg', isMe:true, ring:1 },
    { id:'u1', name:'ZANDER_9X',  avatarEmoji:'', gender:'m', ringColor:'#7c3aed',
      activityEmoji:'🎮', nameStyle:'text', nameColor:'#a78bfa',
      wx:40, wy:41, size:'md', isMe:false, ring:1 },
    { id:'u2', name:'KAI_GHOST',  avatarEmoji:'', gender:'f', ringColor:'#10b981',
      activityEmoji:'🔥', nameStyle:'text', nameColor:'#34d399',
      wx:61, wy:40, size:'sm', isMe:false, ring:1 },
    { id:'u3', name:'SOL_RUNNER', avatarEmoji:'', gender:'m', ringColor:'#06b6d4',
      activityEmoji:'🎵', nameStyle:'text', nameColor:'#67e8f9',
      wx:30, wy:60, size:'sm', isMe:false, ring:2 },
    { id:'u4', name:'MOCHI_BABE', avatarEmoji:'', gender:'f', ringColor:'#ec4899',
      activityEmoji:'✨', nameStyle:'text', nameColor:'#f9a8d4',
      wx:68, wy:57, size:'sm', isMe:false, ring:2 },
    { id:'u5', name:'DRIFT_X',    avatarEmoji:'', gender:'m', ringColor:'#f59e0b',
      activityEmoji:'🎯', nameStyle:'text', nameColor:'#fcd34d',
      wx:47, wy:68, size:'sm', isMe:false, ring:2 },
    { id:'u6', name:'NIGHT_OWL',  avatarEmoji:'', gender:'f', ringColor:'#8b5cf6',
      activityEmoji:'🌙', nameStyle:'text', nameColor:'#c4b5fd',
      wx:19, wy:37, size:'sm', isMe:false, ring:3 },
    { id:'u7', name:'PIXEL_WAVE', avatarEmoji:'', gender:'m', ringColor:'#22d3ee',
      activityEmoji:'🎶', nameStyle:'text', nameColor:'#67e8f9',
      wx:73, wy:28, size:'sm', isMe:false, ring:3 },
    { id:'u8', name:'GHOST_RUN',  avatarEmoji:'', gender:'f', ringColor:'#a3e635',
      activityEmoji:'💨', nameStyle:'text', nameColor:'#bef264',
      wx:42, wy:76, size:'sm', isMe:false, ring:3 },
  ]);

  lobbyCards = signal<LobbyCard[]>([
    {
      id: 'c1', status: 'active', statusLabel: 'ACTIVE',
      title: 'Ludo Masters', players: 3, maxPlayers: 4,
      bgGradient: 'linear-gradient(135deg, #1a1040 0%, #2d1b5e 50%, #1a1040 100%)',
      bgEmoji: '🎲', action: 'join-match', svgCard: true
    },
    {
      id: 'c2', status: 'waiting', statusLabel: 'WAITING',
      title: 'Puzzle Solvers', players: 1, maxPlayers: 2,
      host: 'NeoWalker_01',
      bgGradient: 'linear-gradient(135deg, #1a1228 0%, #2a1f3d 50%, #1a1228 100%)',
      bgEmoji: '🧩', action: 'join-room'
    },
    {
      id: 'c3', status: 'new', statusLabel: 'NEW LOBBY',
      title: 'Blitz Tournament', players: 0, maxPlayers: 8,
      isOpen: true, startNote: 'Starts in 15 mins. Limited seats remaining.',
      bgGradient: 'linear-gradient(135deg, #0f1a0f 0%, #1a2d10 50%, #0f1a0f 100%)',
      bgEmoji: '♟️', action: 'register'
    }
  ]);

  joinCard(card: LobbyCard) {
    this.lobbyCards.update(cards =>
      cards.map(c => c.id === card.id ? { ...c, players: c.players + 1 } : c)
    );
  }

  private countTimer?: ReturnType<typeof setInterval>;

  constructor(
    private zoneService: ZoneService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.viewportEl = document.querySelector('.lounge-viewport') as HTMLElement;
    const zoneId = this.route.snapshot.params['id'];
    const found  = this.zoneService.mockZones.find(z => z.id === zoneId);
    this.zone.set(found || this.zoneService.mockZones[0]);

    // Read vibe from query params
    const vibe = this.route.snapshot.queryParamMap.get('vibe');
    if (vibe) {
      this.currentVibe = vibe.toUpperCase().replace('-', ' ');
      this.currentVibeEmoji = this.vibeEmojiMap[vibe] || '✨';
    }

    this.countTimer = setInterval(() =>
      this.playerCount.set(38 + Math.floor(Math.random() * 10)), 7000);

    // Countdown timer for event alert
    this.timerInterval = setInterval(() => {
      if (this.timerSeconds > 0) {
        this.timerSeconds--;
        const m = Math.floor(this.timerSeconds / 60);
        const s = this.timerSeconds % 60;
        this.eventTimer = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      }
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countTimer) clearInterval(this.countTimer);
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  adjustZoom(delta: number) {
    const next = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, this.zoomLevel() + delta));
    this.zoomLevel.set(Math.round(next * 100) / 100);
    // Re-clamp pan to the new zoom's bounds
    const clamped = this.clampPan(this.panX(), this.panY());
    this.panX.set(clamped.x);
    this.panY.set(clamped.y);
  }

  openProfile(u: LoungeUser) {
    if (!u.isMe) this.peekedUser.set(u);
  }

  setAction(tab: ActionTab) {
    this.activeAction.set(tab);
    const zoneId = this.route.snapshot.params['id'] || 'zone_001';
    if (tab === 'vibe') this.router.navigate(['/app/vibes'], { queryParams: { fromZone: zoneId } });
  }

  leaveZone() {
    this.zoneService.leaveZone();
    this.router.navigate(['/app/map']);
  }

  releaseConfession() {
    if (!this.confessText.trim()) return;
    this.confessionFeed.update(f => [{
      id: 'c' + Date.now(), avatarEmoji: '🎭', timeAgo: 'just now',
      mood: this.selectedMood(), text: this.confessText, revealed: false
    }, ...f]);
    this.confessText = '';
  }

  revealPost(post: ConfessionPost) {
    this.confessionFeed.update(f => f.map(p => p.id === post.id ? {...p, revealed:true} : p));
  }
}
