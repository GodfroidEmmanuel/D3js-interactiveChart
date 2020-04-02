//mise en place pas besoin de données
const dims = {height: 300, width: 300, radius: 150};

const svg = d3.select('.box')
              .append('svg')
              .attr('width', dims.width + 150)
              .attr('height', dims.height + 150)

const graph = svg.append('g')
                 .attr('transform', `translate(${dims.width / 2 + 5}, ${dims.height / 2 + 5} )`)


const pie = d3.pie()
              .sort(null)
              .value(d => d.prix);

const arcPath = d3.arc()
                  .outerRadius(dims.radius)
                  .innerRadius(dims.radius / 2);


//////////////////couleurs///////////////////////

const couleur = d3.scaleOrdinal(d3['schemeAccent']);





//////////////////legendes///////////////////////

const groupeLegendes = svg.append('g')
                          .attr('transform', `translate(${dims.width + 40}, 10)`)

const legendes = d3.legendColor()
                   .shape('circle')
                   .scale(couleur)





//////////////// fonction maj//////////////////////////

const maj = (donnee) => {


    //domaine des couleurs//
    couleur.domain(donnee.map(d => d.nom))

    //domaine legendes

    groupeLegendes.call(legendes);
    groupeLegendes.selectAll('text')
                  .attr('fill', 'white')

    //liaison path => données

    const paths = graph.selectAll('path')
                       .data(pie(donnee));




///////////////////////exit//////////////////////////////

    paths.exit().remove();

    //maj du dom

    paths.attr('d', arcPath)





    paths.enter()
        .append('path')
        //.attr('d', arcPath)
        .attr('stroke', '#fff')
        .attr('stroke-width', 3)
        .attr('fill', d => couleur(d.data.nom))
        .transition()
        .duration(700)
        .attrTween('d', animEnter);



// evenement supprimer

    graph.selectAll('path')
         .on('click', deleteClick);
}


//database

let donnee = [];

db.collection('Dépenses').onSnapshot(res => {

    res.docChanges().forEach(change => {

        const doc = {...change.doc.data(), id: change.doc.id};

        switch (change.type) {
            case 'added':
                donnee.push(doc)
                break;
            case 'modified':
                const index = donnee.findIndex(item => item.id == doc.id);
                donnee[index] = doc;
                break;
            case 'removed':
                donnee = donnee.filter(item => item.id !== doc.id);
                break;
            default:
                break;
        }

    });
    maj(donnee)
})


///////////////////////animation enter////////////////////

const animEnter = (d) => {

    let i = d3.interpolate(d.startAngle, d.endAngle);
    return function(t){
        d.endAngle = i(t);
        //on actualise les coordonnees de d
        return arcPath(d);
    }
}


///////////////fonction deleteClick/////////////////////

const deleteClick = (d) => {
    const id = d.data.id;
    db.collection('Dépenses').doc(id).delete();
}