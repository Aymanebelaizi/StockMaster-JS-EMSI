function initDashboardCharts() {
    // 1. Pie Chart : Répartition par catégorie 
    new Chart(document.getElementById('chartPie'), {
        type: 'pie',
        data: {
            labels: ['Électronique', 'Mobilier', 'Bureau'],
            datasets: [{
                data: [40, 30, 30],
                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B']
            }]
        }
    });

    // 2. Bar Chart : Comparaison de stock 
    new Chart(document.getElementById('chartBar'), {
        type: 'bar',
        data: {
            labels: ['Produit A', 'Produit B', 'Produit C', 'Produit D'],
            datasets: [{
                label: 'Quantité en main',
                data: [12, 19, 3, 15],
                backgroundColor: '#6366F1'
            }]
        }
    });

    // 3. Line Chart : Tendance mensuelle 
    new Chart(document.getElementById('chartLine'), {
        type: 'line',
        data: {
            labels: ['Jan', 'Féb', 'Mar', 'Avr'],
            datasets: [{
                label: 'Entrées de stock',
                data: [50, 80, 60, 95],
                borderColor: '#EC4899',
                fill: false
            }]
        }
    });

    // 4. Doughnut Chart : Statut des commandes 
    new Chart(document.getElementById('chartDonut'), {
        type: 'doughnut',
        data: {
            labels: ['Livrées', 'En cours', 'Annulées'],
            datasets: [{
                data: [70, 20, 10],
                backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
            }]
        }
    });

    // 5. Polar Area Chart : Performance Fournisseurs 
    new Chart(document.getElementById('chartPolar'), {
        type: 'polarArea',
        data: {
            labels: ['Fournisseur X', 'Fournisseur Y', 'Fournisseur Z'],
            datasets: [{
                data: [15, 25, 10],
                backgroundColor: ['#8B5CF6', '#3B82F6', '#6EE7B7']
            }]
        }
    });
}