import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-callback',
  standalone: true,
  template: '',
})
export class CallbackComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    // APP_INITIALIZER has already exchanged the OAuth code for a token by the
    // time this component renders.  Read the saved return URL (set in
    // login.component before initiating the code flow) and navigate there.
    const returnUrl = sessionStorage.getItem('auth_return_url') ?? '/';
    sessionStorage.removeItem('auth_return_url');
    this.router.navigateByUrl(returnUrl, { replaceUrl: true });
  }
}
