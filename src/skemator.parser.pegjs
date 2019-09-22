{
  const sentences = [];
  const generateID = () => '_' + Math.random().toString(36).substr(2, 9);
  const scriptOptions = {
    "graph.direction": "BT"
  };
  const setOption = (option, value) => {
    scriptOptions[option] = value;
  };
  const addSentence = (sentence) => {
    if(sentences.indexOf(sentence) === -1) {
      sentences.push(sentence);
    }
    return sentence;
  };
  const findParent = (sentence) => {
    for(let i=sentences.length-1; i >= 0; i--) {
      let reverSentence = sentences[i];
      const isLess = ("tabulacion" in reverSentence) && (reverSentence.tabulacion < sentence.tabulacion);
      if(isLess) {
        return i;
      }
    }
    return null;
  };
  const findParentAndAdd = (sentence) => {
    const parent = findParent(sentence);
    addSentence(sentence, parent);
    return parent;
  };
  const fromNodeToMermaid = (node, sentences, isInline = false) => {
    if(node.tipoNodo === "@") {
      return node.volcadoNodo;
    }
    let out = "";
    if(!node.volcadoNodo) {
      if(node.unico) {
        node.volcadoNodo = generateID();
      } else {
      node.volcadoNodo = node.nombreNodo
        .replace(/ /g, "_")
        .replace(/[àáÀÁ]/g, "a")
        .replace(/[èéÈÉ]/g, "e")
        .replace(/[ìíÌÍ]/g, "i")
        .replace(/[òóÒÓ]/g, "o")
        .replace(/[ùúÙÚ]/g, "i")
        .replace(/[ç]/g, "c")
        .replace(/[ñ]/g, "nh")
        .replace(/[^A-Za-z0-9\$\_]/g, "");
      }
    }
    out += node.volcadoNodo + "[" + JSON.stringify(node.nombreNodo) + "]";
    if(node.padre || (node.padre === 0)) {
      out += ";\n" + sentences[node.padre].volcadoNodo + " " + ((node.alineadoNodo && node.alineadoNodo.tipoRelacion) ? node.alineadoNodo.tipoRelacion : "-->") + " " + node.volcadoNodo;
    }
    return out;
  };
  const fromSentenceToMermaid = (sentence, sentences) => {
    let out = "";
    if(sentence.tipoSentencia === "nodo") {
      out += fromNodeToMermaid(sentence, sentences);
    } else if(sentence.tipoSentencia === "relacion") {
      out += fromNodeToMermaid(sentence.nodoOrigen, sentences, true);
      out += " " + sentence.alineadoNodo.tipoRelacion;
      if(sentence.alineadoNodo.mensajeRelacion) {
        out += "|" + sentence.alineadoNodo.mensajeRelacion + "|";
      }
      out += fromNodeToMermaid(sentence.nodoDestino, sentences, true);
    }
    out += ";\n";
    return out;
  };
  const toMermaid = (sentences) => {
    let out = "";
    out += "graph " + scriptOptions["graph.direction"] + ";\n\n";
    Object.keys(sentences).forEach(index => {
      const sentence = sentences[index];
      out += fromSentenceToMermaid(sentence, sentences);
    });
    return out;
  };
}
Lenguaje = __* (Opciones Fin_de_sentencia)?  d:Diagrama __* {return d}
Opciones = "#T2B" {setOption("graph.direction", "TD")} 
  / "#B2T" {setOption("graph.direction", "BT")} 
    / "#L2R" {setOption("graph.direction", "LR")} 
    / "#R2L" {setOption("graph.direction", "RL")} 
Diagrama = s:Bloque {return {mmd:toMermaid(s),ast:s}}
Bloque = Sentencia_completa*
Sentencia_completa = s:Sentencia Fin_de_sentencia {return {...s, ...(s.tipoSentencia==="relacion" ? {} : {padre:findParentAndAdd(s)})}}
Sentencia = Sentencia_relacion / Sentencia_nodo
Sentencia_nodo = t:Tabulacion n:Sentencia_nodo_contenido {return {tipoSentencia:"nodo",...n,...t}}
Sentencia_nodo_contenido = a:Alineado_de_nodo? u:Unicidad_de_nodo? n:Nodos_por_tipo {return {...n, ...{alineadoNodo:a?a:null},...{unico:u?true:false}}}
Unicidad_de_nodo = "*"
Nodos_por_tipo = Nodo_tipo_1 / Nodo_tipo_2 / Nodo_tipo_3 / Nodo_tipo_4 / Nodo_tipo_5 / Nodo_tipo_6
Nodo_tipo_1 = "<" _* n:(!(_* ">").)+ _* ">" v:Volcado_de_nodo? {return {tipoNodo:"<>",nombreNodo:n.map(ni => ni[1]).join(""), ...(v?v:{volcadoNodo:null})}}
Nodo_tipo_2 = "[" _* n:(!(_* "]").)+ _* "]" v:Volcado_de_nodo? {return {tipoNodo:"[]",nombreNodo:n.map(ni => ni[1]).join(""), ...(v?v:{volcadoNodo:null})}}
Nodo_tipo_3 = "{" _* n:(!(_* "}").)+ _* "}" v:Volcado_de_nodo? {return {tipoNodo:"{}",nombreNodo:n.map(ni => ni[1]).join(""), ...(v?v:{volcadoNodo:null})}}
Nodo_tipo_4 = "(" _* n:(!(_* ")").)+ _* ")" v:Volcado_de_nodo? {return {tipoNodo:"()",nombreNodo:n.map(ni => ni[1]).join(""), ...(v?v:{volcadoNodo:null})}}
Nodo_tipo_5 = "((" _* n:(!(_* "))").)+ _* "))" v:Volcado_de_nodo? {return {tipoNodo:"(())",nombreNodo:n.map(ni => ni[1]).join(""), ...(v?v:{volcadoNodo:null})}}
Nodo_tipo_6 = "@" n:Nombre_de_variable {return {tipoNodo:"@",nombre:text().substr(1),volcadoNodo:n}}
Volcado_de_nodo = "=" v:Nombre_de_variable {return {volcadoNodo:v}}
Nombre_de_variable = [A-Za-z0-9_$]+ {return text()}
Alineado_de_nodo = a:( Mensaje_interlineal_grueso_vacio / Mensaje_interlineal_fino_vacio / Mensaje_interlineal_lineal_vacio / Mensaje_interlineal_punteado_vacio / Mensaje_interlineal_grueso / Mensaje_interlineal_fino / Mensaje_interlineal_lineal / Mensaje_interlineal_punteado ) {return {...a}}
Mensaje_interlineal_grueso_vacio = t:"==>" {return {tipoRelacion:t,mensajeRelacion:null}}
Mensaje_interlineal_fino_vacio = t:"-->" {return {tipoRelacion:t,mensajeRelacion:null}}
Mensaje_interlineal_lineal_vacio = t:"---" {return {tipoRelacion:t,mensajeRelacion:null}}
Mensaje_interlineal_punteado_vacio = t:".->" {return {tipoRelacion:t,mensajeRelacion:null}}
Mensaje_interlineal_grueso = "--" m:Mensaje_interlineal_grueso_texto t:"==>" {return {tipoRelacion:t,mensajeRelacion:m}}
Mensaje_interlineal_fino = "--" m:Mensaje_interlineal_fino_texto t:"-->" {return {tipoRelacion:t,mensajeRelacion:m}}
Mensaje_interlineal_lineal = "--" m:Mensaje_interlineal_lineal_texto t:"---" {return {tipoRelacion:t,mensajeRelacion:m}}
Mensaje_interlineal_punteado = "--" m:Mensaje_interlineal_punteado_texto t:".->" {return {tipoRelacion:t,mensajeRelacion:m}}
Mensaje_interlineal_grueso_texto = (!("==>"/"\n").)+ {return text().trim()}
Mensaje_interlineal_fino_texto = (!("-->"/"\n").)+ {return text().trim()}
Mensaje_interlineal_lineal_texto = (!("---"/"\n").)+ {return text().trim()}
Mensaje_interlineal_punteado_texto = (!(".->"/"\n").)+ {return text().trim()}
Sentencia_relacion = n:Nodos_por_tipo _* a:Alineado_de_nodo _* n2:Nodos_por_tipo {return {tipoSentencia:"relacion",alineadoNodo:a,nodoOrigen:n,nodoDestino:n2}}
Tabulacion = " "* {return {tabulacion:text().length}}
_ = [\r\t ]
__ = [\n\r\t ]
Fin_de_sentencia = [\n] / "\r\n"