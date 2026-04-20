import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ZoneService } from '../../core/services/zone.service';
import { Zone } from '../../core/models';

type ActionTab = 'lounge' | 'games' | 'talk' | 'confess';

/** Positions are in WORLD coordinates (0–100%) inside the 300%×300% world div */
interface LoungeUser {
  id: string;
  name: string;
  avatarEmoji: string;
  ringColor: string;
  activityEmoji: string;
  nameStyle: 'pill' | 'text';
  nameColor: string;
  /** world x position 0-100 (50 = viewport center) */
  wx: number;
  /** world y position 0-100 (50 = viewport center) */
  wy: number;
  size: 'lg' | 'md' | 'sm';
  isMe: boolean;
  /** distance ring: 1=near, 2=mid, 3=far (far users only visible when zoomed out) */
  ring: 1 | 2 | 3;
}

interface ConfessionPost {
  id: string; avatarEmoji: string; timeAgo: string;
  text: string; revealed: boolean; mood: string;
}

const STEPS = ['Syncing your avatar...', 'Scanning zone frequencies...', 'Connecting...', 'Almost there...'];

@Component({
  selector: 'app-zone',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="zone-root">

      <!-- ══ HEADER ══════════════════════════════════════════ -->
      <div class="zone-header">
        <div class="zh-left">
          <div class="signal-icon">
            <span class="sig-ring sr-o"></span>
            <span class="sig-ring sr-m"></span>
            <span class="sig-dot"></span>
          </div>
          <h1 class="zone-title">{{ (zone()?.name || 'Neon Lounge') | uppercase }}</h1>
        </div>
        <div class="zh-right">
          <button class="players-pill">
            <span class="pill-dot"></span>
            {{ playerCount() }} MEMBERS
          </button>
          <button class="leave-btn" (click)="leaveZone()">✕</button>
        </div>
      </div>

      <!-- ══ LOUNGE VIEWPORT (clips the 300% world) ══════════ -->
      <div class="lounge-viewport">

        <!-- 300%×300% scalable world — transform-origin = viewport center -->
        <div class="lounge-world"
          [style.transform]="'scale(' + zoomLevel() + ')'">

          <!-- ── Map background (inside world, zooms with avatars) ── -->
          <img class="map-bg" src="assets/background_map.svg" alt="" aria-hidden="true"/>

          <!-- ── Avatar nodes ── -->
          @for (u of loungeUsers(); track u.id) {
            <div class="avatar-node"
              [class]="'size-' + u.size"
              [style.left]="u.wx + '%'"
              [style.top]="u.wy + '%'"
              (click)="openProfile(u)">

              <!-- Label pill above avatar -->
              <div class="activity-float">
                @if (u.activityEmoji) { <span>{{ u.activityEmoji }}</span> }
                <span>{{ u.name }}</span>
              </div>

              <div class="avatar-frame" [class.me-frame]="u.isMe"
                [style.border-color]="u.ringColor"
                [style.box-shadow]="'0 0 0 4px ' + u.ringColor + '33, 0 0 18px ' + u.ringColor + '88, 0 0 36px ' + u.ringColor + '44'">
                <div class="avatar-inner">{{ u.avatarEmoji }}</div>
              </div>

            </div>
          }
        </div><!-- /lounge-world -->

        <!-- ── Zoom controls (outside world, always same size) ── -->
        <div class="zoom-controls">
          <button class="zoom-btn" (click)="adjustZoom(0.12)"
            [disabled]="zoomLevel() >= MAX_ZOOM">
            <span>+</span>
          </button>
          <div class="zoom-indicator">
            <div class="zoom-bar-track">
              <div class="zoom-bar-fill"
                [style.height]="zoomPercent() + '%'"></div>
            </div>
          </div>
          <button class="zoom-btn" (click)="adjustZoom(-0.12)"
            [disabled]="zoomLevel() <= MIN_ZOOM">
            <span>−</span>
          </button>
        </div>

        <!-- ── Event Alert + FABs ── -->
        <div class="bottom-right-hud">

          <div class="event-alert">
            <div class="ea-header">
              <svg class="ea-megaphone" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 9V7H20V9H16ZM17.2 16L14 13.6L15.2 12L18.4 14.4L17.2 16ZM15.2 4L14 2.4L17.2 0L18.4 1.6L15.2 4ZM3 15V11H2C1.45 11 0.979167 10.8042 0.5875 10.4125C0.195833 10.0208 0 9.55 0 9V7C0 6.45 0.195833 5.97917 0.5875 5.5875C0.979167 5.19583 1.45 5 2 5H6L11 2V14L6 11H5V15H3ZM12 11.35V4.65C12.45 5.05 12.8125 5.5375 13.0875 6.1125C13.3625 6.6875 13.5 7.31667 13.5 8C13.5 8.68333 13.3625 9.3125 13.0875 9.8875C12.8125 10.4625 12.45 10.95 12 11.35Z" fill="#AFA2FF"/>
              </svg>
              <svg class="ea-title-svg" viewBox="0 0 68 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0.792 12V3.6H6.192V5.04H2.376V7.044H5.856V8.484H2.376V10.56H6.264V12H0.792ZM8.4 12L6.264 3.6H7.896L9.672 10.98H9.84L11.616 3.6H13.248L11.112 12H8.4ZM13.656 12V3.6H19.056V5.04H15.24V7.044H18.72V8.484H15.24V10.56H19.128V12H13.656ZM19.704 12V3.6H22.716L24.384 10.92H24.6V3.6H26.16V12H23.148L21.48 4.68H21.264V12H19.704ZM29.088 12V5.04H26.64V3.6H33.12V5.04H30.672V12H29.088ZM34.968 12L37.176 3.6H39.936L42.144 12H40.512L40.056 10.152H37.056L36.6 12H34.968ZM37.428 8.688H39.684L38.664 4.596H38.448L37.428 8.688ZM42.552 12V3.6H44.136V10.56H47.976V12H42.552ZM48.456 12V3.6H53.856V5.04H50.04V7.044H53.52V8.484H50.04V10.56H53.928V12H48.456ZM54.504 12V3.6H58.152C58.68 3.6 59.14 3.692 59.532 3.876C59.924 4.06 60.228 4.32 60.444 4.656C60.66 4.992 60.768 5.388 60.768 5.844V5.988C60.768 6.492 60.648 6.9 60.408 7.212C60.168 7.524 59.872 7.752 59.52 7.896V8.112C59.84 8.128 60.088 8.238 60.264 8.442C60.44 8.646 60.528 8.916 60.528 9.252V12H58.944V9.48C58.944 9.288 58.894 9.132 58.794 9.012C58.694 8.892 58.528 8.832 58.296 8.832H56.088V12H54.504ZM56.088 7.392H57.984C58.36 7.392 58.654 7.29 58.866 7.086C59.078 6.882 59.184 6.612 59.184 6.276V6.156C59.184 5.82 59.08 5.55 58.872 5.346C58.664 5.142 58.368 5.04 57.984 5.04H56.088V7.392ZM63.288 12V5.04H60.84V3.6H67.32V5.04H64.872V12H63.288Z" fill="white"/>
              </svg>
            </div>
            <p class="ea-body">
              Confession pit opening in
              <span class="ea-time">{{ alertCountdown() }}</span>. Drop your secrets.
            </p>
          </div>

          <div class="fab-stack">
            <button class="fab">
              <svg viewBox="32 24 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M55.1667 57.125V55.4583C53.4306 55.2639 51.941 54.5451 50.6979 53.3021C49.4549 52.059 48.7361 50.5694 48.5417 48.8333H46.875V47.1667H48.5417C48.7361 45.4306 49.4549 43.941 50.6979 42.6979C51.941 41.4549 53.4306 40.7361 55.1667 40.5417V38.875H56.8333V40.5417C58.5694 40.7361 60.059 41.4549 61.3021 42.6979C62.5451 43.941 63.2639 45.4306 63.4583 47.1667H65.125V48.8333H63.4583C63.2639 50.5694 62.5451 52.059 61.3021 53.3021C60.059 54.5451 58.5694 55.2639 56.8333 55.4583V57.125H55.1667ZM56 53.8333C57.6111 53.8333 58.9861 53.2639 60.125 52.125C61.2639 50.9861 61.8333 49.6111 61.8333 48C61.8333 46.3889 61.2639 45.0139 60.125 43.875C58.9861 42.7361 57.6111 42.1667 56 42.1667C54.3889 42.1667 53.0139 42.7361 51.875 43.875C50.7361 45.0139 50.1667 46.3889 50.1667 48C50.1667 49.6111 50.7361 50.9861 51.875 52.125C53.0139 53.2639 54.3889 53.8333 56 53.8333ZM56 51.3333C55.0833 51.3333 54.2986 51.0069 53.6458 50.3542C52.9931 49.7014 52.6667 48.9167 52.6667 48C52.6667 47.0833 52.9931 46.2986 53.6458 45.6458C54.2986 44.9931 55.0833 44.6667 56 44.6667C56.9167 44.6667 57.7014 44.9931 58.3542 45.6458C59.0069 46.2986 59.3333 47.0833 59.3333 48C59.3333 48.9167 59.0069 49.7014 58.3542 50.3542C57.7014 51.0069 56.9167 51.3333 56 51.3333ZM56 49.6667C56.4583 49.6667 56.8507 49.5035 57.1771 49.1771C57.5035 48.8507 57.6667 48.4583 57.6667 48C57.6667 47.5417 57.5035 47.1493 57.1771 46.8229C56.8507 46.4965 56.4583 46.3333 56 46.3333C55.5417 46.3333 55.1493 46.4965 54.8229 46.8229C54.4965 47.1493 54.3333 47.5417 54.3333 48C54.3333 48.4583 54.4965 48.8507 54.8229 49.1771C55.1493 49.5035 55.5417 49.6667 56 49.6667Z" fill="white"/>
              </svg>
            </button>
            <button class="fab">
              <svg viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.5 15.875L0 10.0417L1.375 9L7.5 13.75L13.625 9L15 10.0417L7.5 15.875ZM7.5 11.6667L0 5.83333L7.5 0L15 5.83333L7.5 11.6667ZM7.5 9.54167L12.2917 5.83333L7.5 2.125L2.70833 5.83333L7.5 9.54167Z" fill="white"/>
              </svg>
            </button>
          </div>

        </div>

      </div><!-- /lounge-viewport -->

      <!-- ══ ZONE ACTION BAR ══════════════════════════════════ -->
      <div class="zone-bar">

        <button class="zb-btn" [class.active]="activeAction() === 'games'"
          (click)="setAction('games')">
          <svg class="zb-icon" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.1125 11.6667C1.40417 11.6667 0.855556 11.4201 0.466667 10.9271C0.0777778 10.434 -0.0680556 9.83333 0.0291667 9.125L0.904167 2.875C1.02917 2.04167 1.40069 1.35417 2.01875 0.8125C2.63681 0.270833 3.3625 0 4.19583 0H12.4458C13.2792 0 14.0049 0.270833 14.6229 0.8125C15.241 1.35417 15.6125 2.04167 15.7375 2.875L16.6125 9.125C16.7097 9.83333 16.5639 10.434 16.175 10.9271C15.7861 11.4201 15.2375 11.6667 14.5292 11.6667C14.2375 11.6667 13.9667 11.6146 13.7167 11.5104C13.4667 11.4062 13.2375 11.25 13.0292 11.0417L11.1542 9.16667H5.4875L3.6125 11.0417C3.40417 11.25 3.175 11.4062 2.925 11.5104C2.675 11.6146 2.40417 11.6667 2.1125 11.6667ZM2.44583 9.875L4.82083 7.5H11.8208L14.1958 9.875C14.2236 9.90278 14.3347 9.94444 14.5292 10C14.6819 10 14.8035 9.95486 14.8938 9.86458C14.984 9.77431 15.0153 9.65278 14.9875 9.5L14.0708 3.08333C14.0153 2.68056 13.8347 2.34375 13.5292 2.07292C13.2236 1.80208 12.8625 1.66667 12.4458 1.66667H4.19583C3.77917 1.66667 3.41806 1.80208 3.1125 2.07292C2.80694 2.34375 2.62639 2.68056 2.57083 3.08333L1.65417 9.5C1.62639 9.65278 1.65764 9.77431 1.74792 9.86458C1.83819 9.95486 1.95972 10 2.1125 10C2.14028 10 2.25139 9.95833 2.44583 9.875ZM12.4875 6.66667C12.7236 6.66667 12.9215 6.58681 13.0813 6.42708C13.241 6.26736 13.3208 6.06944 13.3208 5.83333C13.3208 5.59722 13.241 5.39931 13.0813 5.23958C12.9215 5.07986 12.7236 5 12.4875 5C12.2514 5 12.0535 5.07986 11.8938 5.23958C11.734 5.39931 11.6542 5.59722 11.6542 5.83333C11.6542 6.06944 11.734 6.26736 11.8938 6.42708C12.0535 6.58681 12.2514 6.66667 12.4875 6.66667ZM10.8208 4.16667C11.0569 4.16667 11.2549 4.08681 11.4146 3.92708C11.5743 3.76736 11.6542 3.56944 11.6542 3.33333C11.6542 3.09722 11.5743 2.89931 11.4146 2.73958C11.2549 2.57986 11.0569 2.5 10.8208 2.5C10.5847 2.5 10.3868 2.57986 10.2271 2.73958C10.0674 2.89931 9.9875 3.09722 9.9875 3.33333C9.9875 3.56944 10.0674 3.76736 10.2271 3.92708C10.3868 4.08681 10.5847 4.16667 10.8208 4.16667ZM4.77917 6.66667H6.02917V5.20833H7.4875V3.95833H6.02917V2.5H4.77917V3.95833H3.32083V5.20833H4.77917V6.66667Z" fill="#AFA2FF"/>
          </svg>
          <svg class="zb-label-svg" viewBox="0 0 43 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.939 12.154C3.411 12.154 2.9325 12.0348 2.5035 11.7965C2.0745 11.5582 1.7335 11.2098 1.4805 10.7515C1.2275 10.2932 1.101 9.734 1.101 9.074V7.226C1.101 6.236 1.37967 5.47517 1.937 4.9435C2.49433 4.41183 3.24967 4.146 4.203 4.146C5.149 4.146 5.8805 4.39717 6.3975 4.8995C6.9145 5.40183 7.173 6.082 7.173 6.94V6.984H5.743V6.896C5.743 6.62467 5.68617 6.379 5.5725 6.159C5.45883 5.939 5.28833 5.76483 5.061 5.6365C4.83367 5.50817 4.54767 5.444 4.203 5.444C3.68967 5.444 3.28633 5.60167 2.993 5.917C2.69967 6.23233 2.553 6.66133 2.553 7.204V9.096C2.553 9.63133 2.69967 10.0622 2.993 10.3885C3.28633 10.7148 3.697 10.878 4.225 10.878C4.753 10.878 5.138 10.7387 5.38 10.46C5.622 10.1813 5.743 9.82933 5.743 9.404V9.294H3.917V8.062H7.173V12H5.831V11.263H5.633C5.58167 11.3877 5.49917 11.5197 5.3855 11.659C5.27183 11.7983 5.10133 11.9157 4.874 12.011C4.64667 12.1063 4.335 12.154 3.939 12.154ZM9.131 12L11.155 4.3H13.685L15.709 12H14.213L13.795 10.306H11.045L10.627 12H9.131ZM11.386 8.964H13.454L12.519 5.213H12.321L11.386 8.964ZM17.733 12V4.3H20.428L21.759 11.01H21.957L23.288 4.3H25.983V12H24.575V5.367H24.377L23.057 12H20.659L19.339 5.367H19.141V12H17.733ZM28.535 12V4.3H33.485V5.62H29.987V7.457H33.177V8.777H29.987V10.68H33.551V12H28.535ZM38.402 12.154C37.808 12.154 37.2837 12.0477 36.829 11.835C36.3743 11.6223 36.0187 11.318 35.762 10.922C35.5053 10.526 35.377 10.0493 35.377 9.492V9.184H36.807V9.492C36.807 9.954 36.95 10.3005 37.236 10.5315C37.522 10.7625 37.9107 10.878 38.402 10.878C38.9007 10.878 39.2728 10.779 39.5185 10.581C39.7642 10.383 39.887 10.13 39.887 9.822C39.887 9.60933 39.8265 9.437 39.7055 9.305C39.5845 9.173 39.4085 9.06483 39.1775 8.9805C38.9465 8.89617 38.666 8.81733 38.336 8.744L38.083 8.689C37.555 8.57167 37.1022 8.42317 36.7245 8.2435C36.3468 8.06383 36.0572 7.82733 35.8555 7.534C35.6538 7.24067 35.553 6.85933 35.553 6.39C35.553 5.92067 35.6648 5.51917 35.8885 5.1855C36.1122 4.85183 36.4275 4.59517 36.8345 4.4155C37.2415 4.23583 37.72 4.146 38.27 4.146C38.82 4.146 39.3095 4.2395 39.7385 4.4265C40.1675 4.6135 40.5048 4.89217 40.7505 5.2625C40.9962 5.63283 41.119 6.09667 41.119 6.654V6.984H39.689V6.654C39.689 6.36067 39.6322 6.12417 39.5185 5.9445C39.4048 5.76483 39.2417 5.63283 39.029 5.5485C38.8163 5.46417 38.5633 5.422 38.27 5.422C37.83 5.422 37.5055 5.5045 37.2965 5.6695C37.0875 5.8345 36.983 6.06 36.983 6.346C36.983 6.53667 37.0325 6.698 37.1315 6.83C37.2305 6.962 37.379 7.072 37.577 7.16C37.775 7.248 38.028 7.325 38.336 7.391L38.589 7.446C39.139 7.56333 39.6175 7.71367 40.0245 7.897C40.4315 8.08033 40.7487 8.32233 40.976 8.623C41.2033 8.92367 41.317 9.30867 41.317 9.778C41.317 10.2473 41.1978 10.6598 40.9595 11.0155C40.7212 11.3712 40.3838 11.6498 39.9475 11.8515C39.5112 12.0532 38.996 12.154 38.402 12.154Z" fill="white"/>
          </svg>
        </button>

        <button class="zb-btn" [class.active]="activeAction() === 'talk'"
          (click)="setAction('talk')">
          <svg class="zb-icon" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16.6667 16.6667L13.3333 13.3333H5C4.54167 13.3333 4.14931 13.1701 3.82292 12.8438C3.49653 12.5174 3.33333 12.125 3.33333 11.6667V10.8333H12.5C12.9583 10.8333 13.3507 10.6701 13.6771 10.3438C14.0035 10.0174 14.1667 9.625 14.1667 9.16667V3.33333H15C15.4583 3.33333 15.8507 3.49653 16.1771 3.82292C16.5035 4.14931 16.6667 4.54167 16.6667 5V16.6667ZM1.66667 8.47917L2.64583 7.5H10.8333V1.66667H1.66667V8.47917ZM0 12.5V1.66667C0 1.20833 0.163194 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0H10.8333C11.2917 0 11.684 0.163194 12.0104 0.489583C12.3368 0.815972 12.5 1.20833 12.5 1.66667V7.5C12.5 7.95833 12.3368 8.35069 12.0104 8.67708C11.684 9.00347 11.2917 9.16667 10.8333 9.16667H3.33333L0 12.5ZM1.66667 7.5V1.66667V7.5Z" fill="#C57EFF"/>
          </svg>
          <svg class="zb-label-svg" viewBox="0 0 30 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.065 12V5.62H0.821V4.3H6.761V5.62H4.517V12H3.065ZM7.619 12L9.643 4.3H12.173L14.197 12H12.701L12.283 10.306H9.533L9.115 12H7.619ZM9.874 8.964H11.942L11.007 5.213H10.809L9.874 8.964ZM16.221 12V4.3H17.673V10.68H21.193V12H16.221ZM23.283 12V4.3H24.735V7.358H24.933L27.43 4.3H29.289L26.077 8.095L29.399 12H27.485L24.933 8.876H24.735V12H23.283Z" fill="white"/>
          </svg>
        </button>

        <button class="zb-btn" [class.active]="activeAction() === 'confess'"
          (click)="setAction('confess')">
          <svg class="zb-icon" viewBox="0 0 14 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.66667 9.16667C1.66667 9.88889 1.8125 10.5729 2.10417 11.2188C2.39583 11.8646 2.8125 12.4306 3.35417 12.9167C3.34028 12.8472 3.33333 12.7847 3.33333 12.7292C3.33333 12.6736 3.33333 12.6111 3.33333 12.5417C3.33333 12.0972 3.41667 11.6806 3.58333 11.2917C3.75 10.9028 3.99306 10.5486 4.3125 10.2292L6.66667 7.91667L9.02083 10.2292C9.34028 10.5486 9.58333 10.9028 9.75 11.2917C9.91667 11.6806 10 12.0972 10 12.5417C10 12.6111 10 12.6736 10 12.7292C10 12.7847 9.99306 12.8472 9.97917 12.9167C10.5208 12.4306 10.9375 11.8646 11.2292 11.2188C11.5208 10.5729 11.6667 9.88889 11.6667 9.16667C11.6667 8.47222 11.5382 7.81597 11.2812 7.19792C11.0243 6.57986 10.6528 6.02778 10.1667 5.54167C9.88889 5.72222 9.59722 5.85764 9.29167 5.94792C8.98611 6.03819 8.67361 6.08333 8.35417 6.08333C7.49306 6.08333 6.74653 5.79861 6.11458 5.22917C5.48264 4.65972 5.11806 3.95833 5.02083 3.125C4.47917 3.58333 4 4.05903 3.58333 4.55208C3.16667 5.04514 2.81597 5.54514 2.53125 6.05208C2.24653 6.55903 2.03125 7.07639 1.88542 7.60417C1.73958 8.13194 1.66667 8.65278 1.66667 9.16667ZM6.66667 10.25L5.47917 11.4167C5.32639 11.5694 5.20833 11.7431 5.125 11.9375C5.04167 12.1319 5 12.3333 5 12.5417C5 12.9861 5.16319 13.3681 5.48958 13.6875C5.81597 14.0069 6.20833 14.1667 6.66667 14.1667C7.125 14.1667 7.51736 14.0069 7.84375 13.6875C8.17014 13.3681 8.33333 12.9861 8.33333 12.5417C8.33333 12.3194 8.29167 12.1146 8.20833 11.9271C8.125 11.7396 8.00694 11.5694 7.85417 11.4167L6.66667 10.25ZM6.66667 0V2.75C6.66667 3.22222 6.82986 3.61806 7.15625 3.9375C7.48264 4.25694 7.88194 4.41667 8.35417 4.41667C8.60417 4.41667 8.83681 4.36458 9.05208 4.26042C9.26736 4.15625 9.45833 4 9.625 3.79167L10 3.33333C11.0278 3.91667 11.8403 4.72917 12.4375 5.77083C13.0347 6.8125 13.3333 7.94444 13.3333 9.16667C13.3333 11.0278 12.6875 12.6042 11.3958 13.8958C10.1042 15.1875 8.52778 15.8333 6.66667 15.8333C4.80556 15.8333 3.22917 15.1875 1.9375 13.8958C0.645833 12.6042 0 11.0278 0 9.16667C0 7.375 0.600695 5.67361 1.80208 4.0625C3.00347 2.45139 4.625 1.09722 6.66667 0Z" fill="#FF6E84"/>
          </svg>
          <svg class="zb-label-svg" viewBox="0 0 55 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.202 12.154C3.24867 12.154 2.49333 11.8882 1.936 11.3565C1.37867 10.8248 1.1 10.064 1.1 9.074V7.226C1.1 6.236 1.37867 5.47517 1.936 4.9435C2.49333 4.41183 3.24867 4.146 4.202 4.146C5.148 4.146 5.8795 4.4045 6.3965 4.9215C6.9135 5.4385 7.172 6.148 7.172 7.05V7.116H5.742V7.006C5.742 6.55133 5.6155 6.17733 5.3625 5.884C5.1095 5.59067 4.72267 5.444 4.202 5.444C3.68867 5.444 3.28533 5.60167 2.992 5.917C2.69867 6.23233 2.552 6.66133 2.552 7.204V9.096C2.552 9.63133 2.69867 10.0585 2.992 10.3775C3.28533 10.6965 3.68867 10.856 4.202 10.856C4.72267 10.856 5.1095 10.7075 5.3625 10.4105C5.6155 10.1135 5.742 9.74133 5.742 9.294V9.096H7.172V9.25C7.172 10.152 6.9135 10.8615 6.3965 11.3785C5.8795 11.8955 5.148 12.154 4.202 12.154ZM12.452 12.154C11.484 12.154 10.714 11.8882 10.142 11.3565C9.57 10.8248 9.284 10.064 9.284 9.074V7.226C9.284 6.236 9.57 5.47517 10.142 4.9435C10.714 4.41183 11.484 4.146 12.452 4.146C13.42 4.146 14.19 4.41183 14.762 4.9435C15.334 5.47517 15.62 6.236 15.62 7.226V9.074C15.62 10.064 15.334 10.8248 14.762 11.3565C14.19 11.8882 13.42 12.154 12.452 12.154ZM12.452 10.856C12.9947 10.856 13.4163 10.6983 13.717 10.383C14.0177 10.0677 14.168 9.646 14.168 9.118V7.182C14.168 6.654 14.0177 6.23233 13.717 5.917C13.4163 5.60167 12.9947 5.444 12.452 5.444C11.9167 5.444 11.4968 5.60167 11.1925 5.917C10.8882 6.23233 10.736 6.654 10.736 7.182V9.118C10.736 9.646 10.8882 10.0677 11.1925 10.383C11.4968 10.6983 11.9167 10.856 12.452 10.856ZM17.996 12V4.3H20.757L22.286 11.01H22.484V4.3H23.914V12H21.153L19.624 5.29H19.426V12H17.996ZM26.466 12V4.3H31.306V5.62H27.918V7.479H31.042V8.799H27.918V12H26.466ZM33.44 12V4.3H38.39V5.62H34.892V7.457H38.082V8.777H34.892V10.68H38.456V12H33.44ZM43.307 12.154C42.713 12.154 42.1887 12.0477 41.734 11.835C41.2793 11.6223 40.9237 11.318 40.667 10.922C40.4103 10.526 40.282 10.0493 40.282 9.492V9.184H41.712V9.492C41.712 9.954 41.855 10.3005 42.141 10.5315C42.427 10.7625 42.8157 10.878 43.307 10.878C43.8057 10.878 44.1778 10.779 44.4235 10.581C44.6692 10.383 44.792 10.13 44.792 9.822C44.792 9.60933 44.7315 9.437 44.6105 9.305C44.4895 9.173 44.3135 9.06483 44.0825 8.9805C43.8515 8.89617 43.571 8.81733 43.241 8.744L42.988 8.689C42.46 8.57167 42.0072 8.42317 41.6295 8.2435C41.2518 8.06383 40.9622 7.82733 40.7605 7.534C40.5588 7.24067 40.458 6.85933 40.458 6.39C40.458 5.92067 40.5698 5.51917 40.7935 5.1855C41.0172 4.85183 41.3325 4.59517 41.7395 4.4155C42.1465 4.23583 42.625 4.146 43.175 4.146C43.725 4.146 44.2145 4.2395 44.6435 4.4265C45.0725 4.6135 45.4098 4.89217 45.6555 5.2625C45.9012 5.63283 46.024 6.09667 46.024 6.654V6.984H44.594V6.654C44.594 6.36067 44.5372 6.12417 44.4235 5.9445C44.3098 5.76483 44.1467 5.63283 43.934 5.5485C43.7213 5.46417 43.4683 5.422 43.175 5.422C42.735 5.422 42.4105 5.5045 42.2015 5.6695C41.9925 5.8345 41.888 6.06 41.888 6.346C41.888 6.53667 41.9375 6.698 42.0365 6.83C42.1355 6.962 42.284 7.072 42.482 7.16C42.68 7.248 42.933 7.325 43.241 7.391L43.494 7.446C44.044 7.56333 44.5225 7.71367 44.9295 7.897C45.3365 8.08033 45.6537 8.32233 45.881 8.623C46.1083 8.92367 46.222 9.30867 46.222 9.778C46.222 10.2473 46.1028 10.6598 45.8645 11.0155C45.6262 11.3712 45.2888 11.6498 44.8525 11.8515C44.4162 12.0532 43.901 12.154 43.307 12.154ZM51.073 12.154C50.479 12.154 49.9547 12.0477 49.5 11.835C49.0453 11.6223 48.6897 11.318 48.433 10.922C48.1763 10.526 48.048 10.0493 48.048 9.492V9.184H49.478V9.492C49.478 9.954 49.621 10.3005 49.907 10.5315C50.193 10.7625 50.5817 10.878 51.073 10.878C51.5717 10.878 51.9438 10.779 52.1895 10.581C52.4352 10.383 52.558 10.13 52.558 9.822C52.558 9.60933 52.4975 9.437 52.3765 9.305C52.2555 9.173 52.0795 9.06483 51.8485 8.9805C51.6175 8.89617 51.337 8.81733 51.007 8.744L50.754 8.689C50.226 8.57167 49.7732 8.42317 49.3955 8.2435C49.0178 8.06383 48.7282 7.82733 48.5265 7.534C48.3248 7.24067 48.224 6.85933 48.224 6.39C48.224 5.92067 48.3358 5.51917 48.5595 5.1855C48.7832 4.85183 49.0985 4.59517 49.5055 4.4155C49.9125 4.23583 50.391 4.146 50.941 4.146C51.491 4.146 51.9805 4.2395 52.4095 4.4265C52.8385 4.6135 53.1758 4.89217 53.4215 5.2625C53.6672 5.63283 53.79 6.09667 53.79 6.654V6.984H52.36V6.654C52.36 6.36067 52.3032 6.12417 52.1895 5.9445C52.0758 5.76483 51.9127 5.63283 51.7 5.5485C51.4873 5.46417 51.2343 5.422 50.941 5.422C50.501 5.422 50.1765 5.5045 49.9675 5.6695C49.7585 5.8345 49.654 6.06 49.654 6.346C49.654 6.53667 49.7035 6.698 49.8025 6.83C49.9015 6.962 50.05 7.072 50.248 7.16C50.446 7.248 50.699 7.325 51.007 7.391L51.26 7.446C51.81 7.56333 52.2885 7.71367 52.6955 7.897C53.1025 8.08033 53.4197 8.32233 53.647 8.623C53.8743 8.92367 53.988 9.30867 53.988 9.778C53.988 10.2473 53.8688 10.6598 53.6305 11.0155C53.3922 11.3712 53.0548 11.6498 52.6185 11.8515C52.1822 12.0532 51.667 12.154 51.073 12.154Z" fill="white"/>
          </svg>
        </button>

      </div>

      <!-- ══ CONFESS OVERLAY (slides up over lounge) ══════════ -->
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

      <!-- ══ PROFILE PEEK SHEET ════════════════════════════════ -->
      @if (peekedUser()) {
        <div class="sheet-backdrop" (click)="peekedUser.set(null)">
          <div class="profile-sheet" (click)="$event.stopPropagation()">
            <div class="sheet-handle"></div>
            <div class="sheet-avatar"
              [style.border-color]="peekedUser()!.ringColor"
              [style.box-shadow]="'0 0 24px ' + peekedUser()!.ringColor + '88'">
              {{ peekedUser()!.avatarEmoji }}
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

    /* ── Root ─────────────────────────────────────────── */
    .zone-root {
      display: flex; flex-direction: column; flex: 1; min-height: 0;
      background: #090912; position: relative; overflow: hidden;
    }

    /* ── Header ───────────────────────────────────────── */
    .zone-header {
      flex-shrink: 0; display: flex; align-items: center;
      justify-content: space-between; padding: 12px 16px;
      padding-top: calc(env(safe-area-inset-top, 0px) + 12px);
      background: rgba(9,9,18,0.96); backdrop-filter: blur(12px);
      border-bottom: 1px solid rgba(255,255,255,0.06); z-index: 20;
    }
    .zh-left { display: flex; align-items: center; gap: 10px; }
    .zh-right { display: flex; align-items: center; gap: 8px; }

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
      font-size: 15px; font-weight: 900; color: white; letter-spacing: 1.5px; margin: 0;
    }
    .players-pill {
      display: flex; align-items: center; gap: 6px;
      background: rgba(16,185,129,0.1); border: 1.5px solid rgba(16,185,129,0.35);
      border-radius: 20px; padding: 5px 12px; font-size: 11px; font-weight: 700;
      color: #10b981; cursor: default; letter-spacing: 0.5px;
    }
    .pill-dot {
      width: 7px; height: 7px; border-radius: 50%; background: #10b981;
      box-shadow: 0 0 6px #10b981; animation: pill-blink 1.5s infinite;
    }
    @keyframes pill-blink { 0%,100%{opacity:1}50%{opacity:0.4} }
    .leave-btn {
      width: 30px; height: 30px; border-radius: 50%;
      background: rgba(255,255,255,0.08); border: none;
      color: rgba(255,255,255,0.5); font-size: 13px; cursor: pointer;
    }

    /* ══ LOUNGE VIEWPORT ══════════════════════════════════ */
    .lounge-viewport {
      flex: 1; min-height: 0; position: relative; overflow: hidden;
    }

    /*
      The world is 3× the viewport in both dimensions.
      top: -100% and left: -100% centre it so viewport-centre = world 50,50%.
      transform-origin: 50% 50%  keeps that centre-point fixed while scaling.
    */
    .lounge-world {
      position: absolute;
      width: 300%; height: 300%;
      top: -100%; left: -100%;
      transform-origin: 50% 50%;
      transition: transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1);
      z-index: 1;
    }

    /* ── Map background — fills the 300×300% world, zooms with avatars ── */
    .map-bg {
      position: absolute; inset: 0; width: 100%; height: 100%;
      object-fit: cover; pointer-events: none; z-index: 0;
    }

    /* ── Avatar nodes ───────────────────────────────────── */
    .avatar-node {
      position: absolute; display: flex; flex-direction: column;
      align-items: center; gap: 4px;
      transform: translate(-50%, -50%); cursor: pointer; z-index: 10;
      transition: transform 0.2s;
      &:active { transform: translate(-50%, -50%) scale(0.92); }
    }
    /* Sizes */
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

    .username-pill {
      background: rgba(20,16,40,0.82); border: 1px solid rgba(139,92,246,0.45);
      border-radius: 20px; padding: 4px 12px;
      font-size: min(11px, 2.8vw); font-weight: 700; color: white;
      white-space: nowrap; backdrop-filter: blur(6px);
    }
    .username-text {
      font-size: min(10px, 2.5vw); font-weight: 700;
      letter-spacing: 0.5px; white-space: nowrap;
      color: rgba(255,255,255,0.9);
      text-shadow: 0 1px 6px rgba(0,0,0,0.95);
    }
    .you-sparkle {
      font-size: 10px; color: #facc15; letter-spacing: 4px;
      animation: sparkle-spin 2s linear infinite;
    }
    @keyframes sparkle-spin{0%,100%{opacity:0.7}50%{opacity:1;transform:scale(1.15)}}

    /* ── Zoom Controls ─────────────────────────────────── */
    .zoom-controls {
      position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      z-index: 30;
    }
    .zoom-btn {
      width: 38px; height: 38px; border-radius: 50%;
      background: rgba(20,18,40,0.85); border: 1.5px solid rgba(124,58,237,0.35);
      color: white; font-size: 22px; font-weight: 300; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      backdrop-filter: blur(8px); transition: all 0.2s;
      line-height: 1;
      &:not(:disabled):active {
        background: rgba(124,58,237,0.3); border-color: rgba(124,58,237,0.7);
        transform: scale(0.92);
      }
      &:disabled { opacity: 0.3; cursor: default; }
    }
    .zoom-indicator { display: flex; flex-direction: column; align-items: center; }
    .zoom-bar-track {
      width: 4px; height: 50px; border-radius: 2px;
      background: rgba(255,255,255,0.1); overflow: hidden;
      display: flex; flex-direction: column-reverse;
    }
    .zoom-bar-fill {
      width: 100%; border-radius: 2px;
      background: linear-gradient(0deg, #7c3aed, #c4b5fd);
      transition: height 0.3s ease;
    }

    /* ── Bottom-right HUD (event alert + FABs) ─────────── */
    .bottom-right-hud {
      position: absolute; bottom: 14px; right: 14px;
      display: flex; flex-direction: column; align-items: flex-end; gap: 10px; z-index: 25;
    }
    .event-alert {
      background: rgba(16,14,35,0.88);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px; padding: 12px 14px;
      display: flex; flex-direction: column; gap: 6px;
      max-width: 200px; backdrop-filter: blur(12px);
    }
    .ea-header {
      display: flex; align-items: center; gap: 8px;
    }
    .ea-megaphone { width: 18px; height: 18px; flex-shrink: 0; }
    .ea-title-svg { height: 12px; width: auto; }
    .ea-body {
      font-size: 11px; color: #AAA8C3; line-height: 1.6; margin: 0;
      font-weight: 400; letter-spacing: 0.1px;
    }
    .ea-time { color: #AFA2FF; font-weight: 600; }
    .fab-stack {
      display: flex; flex-direction: column; gap: 10px;
    }
    .fab {
      width: 44px; height: 44px; border-radius: 50%;
      background: rgba(22,18,45,0.85);
      border: 1px solid rgba(255,255,255,0.1);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; backdrop-filter: blur(10px);
      transition: all 0.2s;
      svg { width: 22px; height: 22px; }
      &:active { transform: scale(0.92); background: rgba(124,58,237,0.3); }
    }

    /* ══ ZONE ACTION BAR ══════════════════════════════════ */
    .zone-bar {
      flex-shrink: 0; display: flex; align-items: center;
      justify-content: space-between; gap: 10px;
      padding: 12px 16px calc(env(safe-area-inset-bottom, 0px) + 12px);
      background: rgba(9,9,18,0.0);
      z-index: 20;
    }
    .zb-btn {
      flex: 1; display: flex; flex-direction: row;
      align-items: center; justify-content: center; gap: 8px;
      background: rgba(22,18,45,0.75);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 14px; cursor: pointer;
      padding: 13px 10px;
      color: rgba(255,255,255,0.55);
      transition: all 0.22s;
      backdrop-filter: blur(10px);
      &.active {
        color: white;
        border-color: rgba(139,92,246,0.5);
        background: rgba(30,20,60,0.85);
        box-shadow: 0 0 16px rgba(124,58,237,0.25);
      }
      &:active { transform: scale(0.96); }
    }
    .zb-icon {
      width: 18px; height: 18px; flex-shrink: 0;
      fill: currentColor; transition: fill 0.22s;
    }
    .zb-btn:nth-child(1) .zb-icon path { fill: #AFA2FF; }
    .zb-btn:nth-child(2) .zb-icon path { fill: #C57EFF; }
    .zb-btn:nth-child(3) .zb-icon path { fill: #FF6E84; }
    .zb-btn.active .zb-icon { filter: drop-shadow(0 0 4px currentColor); }
    .zb-label {
      font-size: 12px; font-weight: 700; letter-spacing: 0.8px;
    }
    .zb-label-svg {
      height: 13px; width: auto; flex-shrink: 0;
    }

    /* ══ CONFESS OVERLAY ══════════════════════════════════ */
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
      /* Never flex-shrink children — scroll the whole body instead */
      flex:1;min-height:0;overflow-y:auto;padding:12px 16px;scrollbar-width:none;
      display:flex;flex-direction:column;gap:10px;
      /* Prevent flex from squeezing children */
      align-items:stretch;
      &::-webkit-scrollbar{display:none}
    }
    .privacy-shield{display:flex;flex-direction:column;gap:3px;flex-shrink:0}
    .ps-label{font-size:11px;font-weight:800;letter-spacing:1px;color:#f59e0b}
    .ps-sub{font-size:13px;color:rgba(255,255,255,0.45)}

    /* Divider below privacy shield */
    .privacy-shield::after{
      content:''; display:block; height:1px;
      background:rgba(255,255,255,0.08); margin-top:10px;
    }

    .confess-card{
      /* Fixed size — never shrinks */
      flex-shrink:0;
      background:rgba(22,18,45,0.8);border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;
    }
    .confess-ta{
      /* Locked height — resize:none + explicit height so flex cannot crush it */
      display:block;
      width:100%; height:110px;           /* fixed, always 110 px tall */
      padding:14px 16px;resize:none;
      border:none;outline:none;
      background:transparent;color:white;font-size:14px;line-height:1.6;
      font-family:inherit;box-sizing:border-box;
      overflow-y:auto;                     /* scroll inside if text overflows */
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
      flex-shrink:0;
      width:100%;padding:13px;border-radius:16px;border:none;
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

    /* ══ PROFILE SHEET ════════════════════════════════════ */
    .sheet-backdrop{
      position:absolute;inset:0;background:rgba(0,0,0,0.65);
      display:flex;align-items:flex-end;z-index:50;
    }
    .profile-sheet{
      width:100%;background:rgba(18,15,38,0.98);border-radius:24px 24px 0 0;
      border-top:1px solid rgba(124,58,237,0.3);padding:16px 28px 40px;
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
  `]
})
export class ZoneComponent implements OnInit, OnDestroy {
  readonly MIN_ZOOM = 0.35;
  readonly MAX_ZOOM = 1.05;

  zone         = signal<Zone | null>(null);
  peekedUser   = signal<LoungeUser | null>(null);
  activeAction = signal<ActionTab>('lounge');
  playerCount  = signal(42);
  zoomLevel    = signal(0.65);   // default: near+mid ring visible

  /** 0–100 % for the zoom bar fill (0 = min zoom, 100 = max zoom) */
  zoomPercent = computed(() => {
    const range = this.MAX_ZOOM - this.MIN_ZOOM;
    return Math.round(((this.zoomLevel() - this.MIN_ZOOM) / range) * 100);
  });

  /* ── Confess state ─────────────────────────────────── */
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

  /* ── Lounge users ──────────────────────────────────── */
  /*
    wx/wy are world % positions (0-100).
    world = 300%×300% div, so world 50%/50% = viewport center.
    Ring 1 (±8-12%):  visible at default zoom 0.65
    Ring 2 (±18-23%): visible at default zoom 0.65 (near edge)
    Ring 3 (±30-38%): visible only when zoomed out ≤ 0.48
  */
  loungeUsers = signal<LoungeUser[]>([
    // ── ME ── always center
    { id:'me', name:'NOVA_STREAM', avatarEmoji:'👩‍🎤', ringColor:'#c084fc',
      activityEmoji:'', nameStyle:'pill', nameColor:'white',
      wx:50, wy:50, size:'lg', isMe:true, ring:1 },
    // ── Ring 1 (near) ──
    { id:'u1', name:'ZANDER_9X',  avatarEmoji:'🧑',   ringColor:'#7c3aed',
      activityEmoji:'🎮', nameStyle:'text', nameColor:'#a78bfa',
      wx:40, wy:41, size:'md', isMe:false, ring:1 },
    { id:'u2', name:'KAI_GHOST',  avatarEmoji:'🧑‍💻', ringColor:'#10b981',
      activityEmoji:'🔥', nameStyle:'text', nameColor:'#34d399',
      wx:61, wy:40, size:'sm', isMe:false, ring:1 },
    // ── Ring 2 (medium) ──
    { id:'u3', name:'SOL_RUNNER', avatarEmoji:'🧔',   ringColor:'#06b6d4',
      activityEmoji:'🎵', nameStyle:'text', nameColor:'#67e8f9',
      wx:30, wy:60, size:'sm', isMe:false, ring:2 },
    { id:'u4', name:'MOCHI_BABE', avatarEmoji:'👩',   ringColor:'#ec4899',
      activityEmoji:'✨', nameStyle:'text', nameColor:'#f9a8d4',
      wx:68, wy:57, size:'sm', isMe:false, ring:2 },
    { id:'u5', name:'DRIFT_X',    avatarEmoji:'🧑‍🚀', ringColor:'#f59e0b',
      activityEmoji:'🎯', nameStyle:'text', nameColor:'#fcd34d',
      wx:47, wy:68, size:'sm', isMe:false, ring:2 },
    // ── Ring 3 (far — only visible when zoomed out) ──
    { id:'u6', name:'NIGHT_OWL',  avatarEmoji:'🦉',   ringColor:'#8b5cf6',
      activityEmoji:'🌙', nameStyle:'text', nameColor:'#c4b5fd',
      wx:19, wy:37, size:'sm', isMe:false, ring:3 },
    { id:'u7', name:'PIXEL_WAVE', avatarEmoji:'🎧',   ringColor:'#22d3ee',
      activityEmoji:'🎶', nameStyle:'text', nameColor:'#67e8f9',
      wx:73, wy:28, size:'sm', isMe:false, ring:3 },
    { id:'u8', name:'GHOST_RUN',  avatarEmoji:'👻',   ringColor:'#a3e635',
      activityEmoji:'💨', nameStyle:'text', nameColor:'#bef264',
      wx:42, wy:76, size:'sm', isMe:false, ring:3 },
  ]);

  alertCountdown = signal('04:22');
  private countTimer?: ReturnType<typeof setInterval>;
  private alertTimer?: ReturnType<typeof setInterval>;

  constructor(
    private zoneService: ZoneService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const zoneId = this.route.snapshot.params['id'];
    const found  = this.zoneService.mockZones.find(z => z.id === zoneId);
    this.zone.set(found || this.zoneService.mockZones[0]);
    this.countTimer = setInterval(() =>
      this.playerCount.set(38 + Math.floor(Math.random() * 10)), 7000);
    let secs = 4 * 60 + 22;
    this.alertTimer = setInterval(() => {
      if (secs > 0) secs--;
      const m = Math.floor(secs / 60).toString().padStart(2, '0');
      const s = (secs % 60).toString().padStart(2, '0');
      this.alertCountdown.set(`${m}:${s}`);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.countTimer) clearInterval(this.countTimer);
    if (this.alertTimer) clearInterval(this.alertTimer);
  }

  adjustZoom(delta: number) {
    const next = Math.min(this.MAX_ZOOM, Math.max(this.MIN_ZOOM, this.zoomLevel() + delta));
    this.zoomLevel.set(Math.round(next * 100) / 100);
  }

  openProfile(u: LoungeUser) {
    if (!u.isMe) this.peekedUser.set(u);
  }

  setAction(tab: ActionTab) {
    this.activeAction.set(tab);
    const zoneId = this.route.snapshot.params['id'] || 'zone_001';
    if (tab === 'games') this.router.navigate(['/app/games'],  { queryParams: { fromZone: zoneId } });
    if (tab === 'talk')  this.router.navigate(['/app/vibes'],  { queryParams: { fromZone: zoneId } });
    // 'confess' and 'lounge' — handled in-place, no navigation
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
