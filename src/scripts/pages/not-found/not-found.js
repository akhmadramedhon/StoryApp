export default class NotFound {
    async render() {
        return `
            <section class="not-found">
                <h2>404 - Not Found</h2>
                <a href="#/" class="btn">Kembali ke Home</a>
            </section>
        `;
    }

    async afterRender() {
        // Sengaja kosong biar ga error aja di console
    }
}