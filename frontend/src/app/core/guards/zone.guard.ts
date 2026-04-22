import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ZoneSessionService } from '../services/zone-session.service';

/**
 * Protects routes that require the user to be inside an active zone session.
 * If no valid session exists, redirects to /app/map with ?noZone=1 so the
 * map can display a warning banner.
 */
export const zoneGuard: CanActivateFn = () => {
  const zoneSvc = inject(ZoneSessionService);
  const router  = inject(Router);

  if (zoneSvc.isSessionValid()) {
    return true;
  }

  // Not in a zone (or session expired) → redirect to map with warning flag
  return router.createUrlTree(['/app/map'], { queryParams: { noZone: '1' } });
};
