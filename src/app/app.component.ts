import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { SupabaseService } from './shared/services/supabase.service';
import { CommonModule } from '@angular/common';
import { Subscription as RxJsSubscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import type { Subscription as SupabaseSubscription } from '@supabase/supabase-js';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ CommonModule, RouterModule, HeaderComponent, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'proyecto1';
  showHeader: boolean = false;
  private authSubscription!: SupabaseSubscription;
  private routerSubscription!: RxJsSubscription;

  constructor(private supabase: SupabaseService, private router: Router) {}

  ngOnInit() {
    this.authSubscription = this.supabase.client.auth.onAuthStateChange((event, session) => {
      this.showHeader = !!session;
      this.updateHeaderVisibility(this.router.url);
    }).data.subscription; 

    this.updateHeaderVisibility(this.router.url);

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateHeaderVisibility(event.urlAfterRedirects);
      }
    });
  }

  updateHeaderVisibility(url: string) {
    const noHeaderPages = ['/login', '/register', '/request-password-reset', '/update-password'];
    this.supabase.client.auth.getSession().then(({ data: { session } }) => {
        if (session) {
            this.showHeader = !noHeaderPages.some(page => url.startsWith(page));
        } else {
            this.showHeader = !noHeaderPages.some(page => url.startsWith(page));
        }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
}