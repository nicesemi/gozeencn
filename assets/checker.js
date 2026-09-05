(() => {
    const appEmbedDeepLink = `https://${ Shopify.shop }/admin/themes/${ Shopify.theme.id || 'current' }/editor?context=apps`;

    if (window.__checkForFera) return; // Another script is already checking.

    window.__checkForFera = (() => {
        if (typeof window.fera === 'undefined') {
            if (typeof Shopify !== 'undefined' && !Shopify.designMode) {
                console.warn("Fera widget added to the site but App Embed is not enabled. Please enable it from here: ", appEmbedDeepLink);
            } else {
                const bg = document.createElement('div');
                bg.classList.add('fera-storefrontAdmin-modal-bg');
                const modal = document.createElement('div');
                modal.id = "fera-notInstalledIntoTheme-modal";
                modal.classList.add('fera-storefrontAdmin-modal');

                modal.innerHTML = `
    <style>
        .fera-storefrontAdmin-modal {line-height: 1.3; position: fixed;background-color: rgba(255, 255, 255, 0.25);top: 0;right: 0;bottom: 0;left: 0;z-index: 999;transition: all 0.3s;}
        .fera-storefrontAdmin-modal-bg {position: fixed; display: block !important; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.9);top: 0;right: 0;bottom: 0;left: 0;z-index: 998;transition: all 0.3s;}
        .fera-storefrontAdmin-modal-content {box-shadow: 1px 2px 20px 0px #00000070; width: 400px;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);padding: 2em;background: white;}
        .fera-storefrontAdmin-modal-heading {font-size: 24px;;margin: 0 0 15px;}
        .fera-storefrontAdmin-modal-body {font-size: 14px; line-height: 130%;}
        .fera-storefrontAdmin-modal-btn { border-radius: 6px; padding: 20px 24px; background-color: black; display: inline-block; margin-top: 18px; text-decoration: none; color: white; box-shadow: 1px 1px 3px #0000009e;}
        .fera-storefrontAdmin-modal-btn--loading { opacity: 0.5; pointer-events: none; }
    </style>
    <div class="fera-storefrontAdmin-modal-content">
        <div class="fera-storefrontAdmin-modal-heading">Hold up!</div>
        <div class="fera-storefrontAdmin-modal-body">You're missing the app embed required to render Fera widgets.</div>
        <a href="${ appEmbedDeepLink }" class="fera-storefrontAdmin-modal-btn">Enable App Embed</a>
    </div>`;
                document.body.appendChild(modal);
                document.body.appendChild(bg);

                const btn = document.querySelector('.fera-storefrontAdmin-modal .fera-storefrontAdmin-modal-btn');
                let windowOpened = false;
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (windowOpened) {
                        window.location.reload(true);
                        return;
                    }
                    windowOpened = true;
                    const win = window.open(appEmbedDeepLink);
                    btn.innerHTML = "Reload Page";
                });
            }
        }
    });


    setTimeout(() => {
        if (document.readyState == 'complete') {
            window.__checkForFera();
        } else {
            document.addEventListener('DOMContentLoaded', () => window.__checkForFera());
        }
    }, 1000);
})();
