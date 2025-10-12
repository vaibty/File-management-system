import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * AppComponent - Main application component
 *
 * This is the root component of the File Management System application.
 * It provides the main layout structure and router outlet for navigation.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  /** Application title displayed in the header */
  readonly title = 'File Management System';
}
