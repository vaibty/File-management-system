import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * AppComponent - Main application component
 * Acts as the root component with router outlet
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Test Report Dashboard';
}
