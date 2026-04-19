import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="mobile-shell">
      <router-outlet />
      @if (!hideNav) {
        <nav class="bottom-nav">
          <div class="nav-items">

            <!-- Map -->
            <button class="nav-item" routerLink="/app/map" routerLinkActive="active" #mapLink="routerLinkActive">
              <span class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 14.5L12.5 12.5L14.5 5.5L7.5 7.5L5.5 14.5ZM10 11.5C9.58333 11.5 9.22917 11.3542 8.9375 11.0625C8.64583 10.7708 8.5 10.4167 8.5 10C8.5 9.58333 8.64583 9.22917 8.9375 8.9375C9.22917 8.64583 9.58333 8.5 10 8.5C10.4167 8.5 10.7708 8.64583 11.0625 8.9375C11.3542 9.22917 11.5 9.58333 11.5 10C11.5 10.4167 11.3542 10.7708 11.0625 11.0625C10.7708 11.3542 10.4167 11.5 10 11.5ZM10 20C8.61667 20 7.31667 19.7375 6.1 19.2125C4.88333 18.6875 3.825 17.975 2.925 17.075C2.025 16.175 1.3125 15.1167 0.7875 13.9C0.2625 12.6833 0 11.3833 0 10C0 8.61667 0.2625 7.31667 0.7875 6.1C1.3125 4.88333 2.025 3.825 2.925 2.925C3.825 2.025 4.88333 1.3125 6.1 0.7875C7.31667 0.2625 8.61667 0 10 0C11.3833 0 12.6833 0.2625 13.9 0.7875C15.1167 1.3125 16.175 2.025 17.075 2.925C17.975 3.825 18.6875 4.88333 19.2125 6.1C19.7375 7.31667 20 8.61667 20 10C20 11.3833 19.7375 12.6833 19.2125 13.9C18.6875 15.1167 17.975 16.175 17.075 17.075C16.175 17.975 15.1167 18.6875 13.9 19.2125C12.6833 19.7375 11.3833 20 10 20Z"
                    [attr.fill]="mapLink.isActive ? '#7B61FF' : 'white'"
                    [attr.fill-opacity]="mapLink.isActive ? '1' : '0.3'"/>
                </svg>
              </span>
              <span class="nav-label">Map</span>
            </button>

            <!-- Games -->
            <button class="nav-item" routerLink="/app/games" routerLinkActive="active" #gamesLink="routerLinkActive">
              <span class="nav-icon">
                <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.535 14C1.685 14 1.02667 13.7042 0.56 13.1125C0.0933333 12.5208 -0.0816667 11.8 0.035 10.95L1.085 3.45C1.235 2.45 1.68083 1.625 2.4225 0.975C3.16417 0.325 4.035 0 5.035 0H14.935C15.935 0 16.8058 0.325 17.5475 0.975C18.2892 1.625 18.735 2.45 18.885 3.45L19.935 10.95C20.0517 11.8 19.8767 12.5208 19.41 13.1125C18.9433 13.7042 18.285 14 17.435 14C17.085 14 16.76 13.9375 16.46 13.8125C16.16 13.6875 15.885 13.5 15.635 13.25L13.385 11H6.585L4.335 13.25C4.085 13.5 3.81 13.6875 3.51 13.8125C3.21 13.9375 2.885 14 2.535 14ZM2.935 11.85L5.785 9H14.185L17.035 11.85C17.0683 11.8833 17.2017 11.9333 17.435 12C17.6183 12 17.7642 11.9458 17.8725 11.8375C17.9808 11.7292 18.0183 11.5833 17.985 11.4L16.885 3.7C16.8183 3.21667 16.6017 2.8125 16.235 2.4875C15.8683 2.1625 15.435 2 14.935 2H5.035C4.535 2 4.10167 2.1625 3.735 2.4875C3.36833 2.8125 3.15167 3.21667 3.085 3.7L1.985 11.4C1.95167 11.5833 1.98917 11.7292 2.0975 11.8375C2.20583 11.9458 2.35167 12 2.535 12C2.56833 12 2.70167 11.95 2.935 11.85ZM14.985 8C15.2683 8 15.5058 7.90417 15.6975 7.7125C15.8892 7.52083 15.985 7.28333 15.985 7C15.985 6.71667 15.8892 6.47917 15.6975 6.2875C15.5058 6.09583 15.2683 6 14.985 6C14.7017 6 14.4642 6.09583 14.2725 6.2875C14.0808 6.47917 13.985 6.71667 13.985 7C13.985 7.28333 14.0808 7.52083 14.2725 7.7125C14.4642 7.90417 14.7017 8 14.985 8ZM12.985 5C13.2683 5 13.5058 4.90417 13.6975 4.7125C13.8892 4.52083 13.985 4.28333 13.985 4C13.985 3.71667 13.8892 3.47917 13.6975 3.2875C13.5058 3.09583 13.2683 3 12.985 3C12.7017 3 12.4642 3.09583 12.2725 3.2875C12.0808 3.47917 11.985 3.71667 11.985 4C11.985 4.28333 12.0808 4.52083 12.2725 4.7125C12.4642 4.90417 12.7017 5 12.985 5ZM5.735 8H7.235V6.25H8.985V4.75H7.235V3H5.735V4.75H3.985V6.25H5.735V8Z"
                    [attr.fill]="gamesLink.isActive ? '#7B61FF' : 'white'"
                    [attr.fill-opacity]="gamesLink.isActive ? '1' : '0.4'"/>
                </svg>
              </span>
              <span class="nav-label">Games</span>
            </button>

            <!-- Vibes -->
            <button class="nav-item" routerLink="/app/vibes" routerLinkActive="active" #vibesLink="routerLinkActive">
              <span class="nav-icon">
                <svg width="20" height="15" viewBox="0 0 20 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.925 14.15C2.025 13.2333 1.3125 12.1708 0.7875 10.9625C0.2625 9.75417 0 8.45833 0 7.075C0 5.675 0.2625 4.37083 0.7875 3.1625C1.3125 1.95417 2.025 0.9 2.925 0L4.35 1.425C3.61667 2.15833 3.04167 3.00833 2.625 3.975C2.20833 4.94167 2 5.975 2 7.075C2 8.19167 2.20833 9.23333 2.625 10.2C3.04167 11.1667 3.61667 12.0083 4.35 12.725L2.925 14.15ZM5.75 11.325C5.21667 10.775 4.79167 10.1375 4.475 9.4125C4.15833 8.6875 4 7.90833 4 7.075C4 6.225 4.15833 5.4375 4.475 4.7125C4.79167 3.9875 5.21667 3.35833 5.75 2.825L7.175 4.25C6.80833 4.61667 6.52083 5.04167 6.3125 5.525C6.10417 6.00833 6 6.525 6 7.075C6 7.625 6.10417 8.14167 6.3125 8.625C6.52083 9.10833 6.80833 9.53333 7.175 9.9L5.75 11.325ZM10 9.075C9.45 9.075 8.97917 8.87917 8.5875 8.4875C8.19583 8.09583 8 7.625 8 7.075C8 6.525 8.19583 6.05417 8.5875 5.6625C8.97917 5.27083 9.45 5.075 10 5.075C10.55 5.075 11.0208 5.27083 11.4125 5.6625C11.8042 6.05417 12 6.525 12 7.075C12 7.625 11.8042 8.09583 11.4125 8.4875C11.0208 8.87917 10.55 9.075 10 9.075ZM14.25 11.325L12.825 9.9C13.1917 9.53333 13.4792 9.10833 13.6875 8.625C13.8958 8.14167 14 7.625 14 7.075C14 6.525 13.8958 6.00833 13.6875 5.525C13.4792 5.04167 13.1917 4.61667 12.825 4.25L14.25 2.825C14.7833 3.35833 15.2083 3.9875 15.525 4.7125C15.8417 5.4375 16 6.225 16 7.075C16 7.90833 15.8417 8.6875 15.525 9.4125C15.2083 10.1375 14.7833 10.775 14.25 11.325ZM17.075 14.15L15.65 12.725C16.3833 11.9917 16.9583 11.1417 17.375 10.175C17.7917 9.20833 18 8.175 18 7.075C18 5.95833 17.7917 4.91667 17.375 3.95C16.9583 2.98333 16.3833 2.14167 15.65 1.425L17.075 0C17.975 0.9 18.6875 1.95417 19.2125 3.1625C19.7375 4.37083 20 5.675 20 7.075C20 8.45833 19.7375 9.75417 19.2125 10.9625C18.6875 12.1708 17.975 13.2333 17.075 14.15Z"
                    [attr.fill]="vibesLink.isActive ? '#7B61FF' : 'white'"
                    [attr.fill-opacity]="vibesLink.isActive ? '1' : '0.3'"/>
                </svg>
              </span>
              <span class="nav-label">Vibes</span>
            </button>

            <!-- Message -->
            <button class="nav-item" routerLink="/app/connections" routerLinkActive="active" #msgLink="routerLinkActive">
              <span class="nav-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 20L16 16H6C5.45 16 4.97917 15.8042 4.5875 15.4125C4.19583 15.0208 4 14.55 4 14V13H15C15.55 13 16.0208 12.8042 16.4125 12.4125C16.8042 12.0208 17 11.55 17 11V4H18C18.55 4 19.0208 4.19583 19.4125 4.5875C19.8042 4.97917 20 5.45 20 6V20ZM2 10.175L3.175 9H13V2H2V10.175ZM0 15V2C0 1.45 0.195833 0.979167 0.5875 0.5875C0.979167 0.195833 1.45 0 2 0H13C13.55 0 14.0208 0.195833 14.4125 0.5875C14.8042 0.979167 15 1.45 15 2V9C15 9.55 14.8042 10.0208 14.4125 10.4125C14.0208 10.8042 13.55 11 13 11H4L0 15ZM2 9V2V9Z"
                    [attr.fill]="msgLink.isActive ? '#7B61FF' : 'white'"
                    [attr.fill-opacity]="msgLink.isActive ? '1' : '0.3'"/>
                </svg>
              </span>
              <span class="nav-label">Message</span>
            </button>

            <!-- Profile -->
            <button class="nav-item" routerLink="/app/settings" routerLinkActive="active" #profileLink="routerLinkActive">
              <span class="nav-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 8C6.9 8 5.95833 7.60833 5.175 6.825C4.39167 6.04167 4 5.1 4 4C4 2.9 4.39167 1.95833 5.175 1.175C5.95833 0.391667 6.9 0 8 0C9.1 0 10.0417 0.391667 10.825 1.175C11.6083 1.95833 12 2.9 12 4C12 5.1 11.6083 6.04167 10.825 6.825C10.0417 7.60833 9.1 8 8 8ZM0 16V13.2C0 12.6333 0.145833 12.1125 0.4375 11.6375C0.729167 11.1625 1.11667 10.8 1.6 10.55C2.63333 10.0333 3.68333 9.64583 4.75 9.3875C5.81667 9.12917 6.9 9 8 9C9.1 9 10.1833 9.12917 11.25 9.3875C12.3167 9.64583 13.3667 10.0333 14.4 10.55C14.8833 10.8 15.2708 11.1625 15.5625 11.6375C15.8542 12.1125 16 12.6333 16 13.2V16H0ZM2 14H14V13.2C14 13.0167 13.9542 12.85 13.8625 12.7C13.7708 12.55 13.65 12.4333 13.5 12.35C12.6 11.9 11.6917 11.5625 10.775 11.3375C9.85833 11.1125 8.93333 11 8 11C7.06667 11 6.14167 11.1125 5.225 11.3375C4.30833 11.5625 3.4 11.9 2.5 12.35C2.35 12.4333 2.22917 12.55 2.1375 12.7C2.04583 12.85 2 13.0167 2 13.2V14ZM8 6C8.55 6 9.02083 5.80417 9.4125 5.4125C9.80417 5.02083 10 4.55 10 4C10 3.45 9.80417 2.97917 9.4125 2.5875C9.02083 2.19583 8.55 2 8 2C7.45 2 6.97917 2.19583 6.5875 2.5875C6.19583 2.97917 6 3.45 6 4C6 4.55 6.19583 5.02083 6.5875 5.4125C6.97917 5.80417 7.45 6 8 6Z"
                    [attr.fill]="profileLink.isActive ? '#7B61FF' : 'white'"
                    [attr.fill-opacity]="profileLink.isActive ? '1' : '0.3'"/>
                </svg>
              </span>
              <span class="nav-label">Profile</span>
            </button>

          </div>
        </nav>
      }
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }

    .mobile-shell {
      width: 100%;
      max-width: 430px;
      margin: auto;
      height: 100dvh;
      display: flex;
      flex-direction: column;
      position: relative;
      background: #08080F;
    }

    router-outlet + * { flex: 1; min-height: 0; }

    .bottom-nav {
      flex-shrink: 0;
      width: 100%;
      min-height: 80px;
      background: rgba(15, 12, 30, 0.85);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: none;
      border-radius: 40px 40px 0 0;
      box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.45), 0 -2px 12px rgba(0, 0, 0, 0.3);
      padding-bottom: 24px;
    }

    .nav-items {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 8px;
      margin: 8px 0 0;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 999px;
      padding: 6px 12px 6px;
      transition: all 0.2s;
      min-width: 52px;
    }

    .nav-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 9999px;
    }

    .nav-label {
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.3px;
      color: rgba(255, 255, 255, 0.3);
      transition: color 0.2s;
    }

    .nav-item.active .nav-label {
      color: #7B61FF;
    }

    .nav-item.active {
      background: none;
      filter: drop-shadow(0 0 8px rgba(123, 97, 255, 0.8));
    }
  `]
})
export class ShellComponent implements OnInit {
  hideNav = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const HIDE_ROUTES = ['/zone/', '/zone-entry/'];
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => {
        const url: string = e.urlAfterRedirects;
        this.hideNav = HIDE_ROUTES.some(r => url.includes(r));
      });
    const url = this.router.url;
    this.hideNav = HIDE_ROUTES.some(r => url.includes(r));
  }
}
