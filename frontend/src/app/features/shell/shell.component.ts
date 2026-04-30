import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
  hideNav = false;

  constructor(private router: Router) {}

  ngOnInit() {
    const HIDE_ROUTES = ['/zone-entry/'];
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
