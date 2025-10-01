// Safe Service Worker Registration with Instant Updates
export class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateCheckInterval: number | null = null;

  constructor() {
    this.init();
  }

  private async init() {
    if ('serviceWorker' in navigator) {
      try {
        // Register the service worker
        this.registration = await navigator.serviceWorker.register('/sw-safe.js', {
          scope: '/'
        });

        console.log('SW: Registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', this.handleUpdateFound.bind(this));

        // Check for updates immediately and periodically
        this.checkForUpdates();
        this.startPeriodicUpdateCheck();

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', this.handleControllerChange.bind(this));

      } catch (error) {
        console.error('SW: Registration failed:', error);
      }
    } else {
      console.log('SW: Service Worker not supported');
    }
  }

  private handleUpdateFound() {
    const newWorker = this.registration?.installing;

    if (newWorker) {
      console.log('SW: New version found, installing...');

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('SW: New version ready, prompting user...');
          this.promptUserToUpdate();
        }
      });
    }
  }

  private handleControllerChange() {
    console.log('SW: Controller changed, reloading page...');
    // Optional: Auto-reload for critical updates
    // window.location.reload();
  }

  private promptUserToUpdate() {
    // Create a non-intrusive notification
    const updateBanner = document.createElement('div');
    updateBanner.id = 'sw-update-banner';
    updateBanner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #007bff;
        color: white;
        padding: 10px;
        text-align: center;
        z-index: 10000;
        font-family: Arial, sans-serif;
      ">
        <span>🔄 App updated! </span>
        <button id="sw-update-btn" style="
          background: white;
          color: #007bff;
          border: none;
          padding: 5px 15px;
          border-radius: 3px;
          cursor: pointer;
          margin-left: 10px;
        ">Refresh</button>
        <button id="sw-dismiss-btn" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 5px 15px;
          border-radius: 3px;
          cursor: pointer;
          margin-left: 5px;
        ">Later</button>
      </div>
    `;

    document.body.appendChild(updateBanner);

    // Handle update button
    document.getElementById('sw-update-btn')?.addEventListener('click', () => {
      this.applyUpdate();
      updateBanner.remove();
    });

    // Handle dismiss button
    document.getElementById('sw-dismiss-btn')?.addEventListener('click', () => {
      updateBanner.remove();
    });
  }

  private applyUpdate() {
    if (this.registration?.waiting) {
      // Tell the waiting SW to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  private async checkForUpdates() {
    try {
      await this.registration?.update();
      console.log('SW: Update check completed');
    } catch (error) {
      console.error('SW: Update check failed:', error);
    }
  }

  private startPeriodicUpdateCheck() {
    // Check for updates every 5 minutes
    this.updateCheckInterval = window.setInterval(() => {
      this.checkForUpdates();
    }, 5 * 60 * 1000);
  }

  // Public methods
  public async forceUpdate() {
    console.log('SW: Forcing update check...');
    await this.checkForUpdates();
  }

  public async unregister() {
    if (this.registration) {
      const success = await this.registration.unregister();
      console.log('SW: Unregistered:', success);
      this.registration = null;
    }

    if (this.updateCheckInterval) {
      clearInterval(this.updateCheckInterval);
      this.updateCheckInterval = null;
    }
  }

  public getVersion(): Promise<string> {
    return new Promise((resolve) => {
      if (this.registration?.active) {
        const messageChannel = new MessageChannel();
        messageChannel.port1.onmessage = (event) => {
          resolve(event.data.version);
        };
        this.registration.active.postMessage({ type: 'GET_VERSION' }, [messageChannel.port2]);
      } else {
        resolve('unknown');
      }
    });
  }
}

// Export singleton instance
export const swManager = new ServiceWorkerManager();