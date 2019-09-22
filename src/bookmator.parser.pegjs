{
  const nodes = [];
  const addNode = node => {
    nodes.push(node);
    return node;
  };
  const addFilepath = node => {
    let lastIndex = nodes.length-1;
    let currentTabulation = node.tabulation;
    FindParent:
    for(var i = lastIndex; i >= 0; i--) {
      const nodeCompared = nodes[i];
      if(nodeCompared.tabulation < currentTabulation) {
        currentTabulation = nodeCompared.tabulation;
        node.folder = nodeCompared.folder + node.folder;
        node.file = nodeCompared.folder + node.file;
        break FindParent;
      }
    }
    if(node.tabulation === 0) {
      node.file = node.file.replace(/^\//g, "");
      node.folder = node.folder.replace(/^\//g, "");
    }
    return addNode(node);
  };
}
Language = b:Block _* {return {nodes: b}}
Block = s:( S ( End_S S )* )? {return [].concat(s?s[0]:[]).concat(s && s[1] ? s[1].map(i => i[1]) : [])}
S = S_File
S_File = t:Tabulation f:Filename c:Contents? {return addFilepath({file:f+"/index.md",folder:f,contents:c?c:"",tabulation:t})}
Tabulation = " "* {return text().length}
End_S = "\r\n" / "\n"
Filename = "/" (!(End_S).)+ {return text()}
Contents = Contents_opener c:Contents_inner Contents_closer {return c}
Contents_separator = "-----" "-"*
Contents_inner = (!(End_S Contents_separator).)+ {return text()}
Contents_opener = End_S Contents_separator End_S
Contents_closer = End_S Contents_separator
_ = [\n\r\t ]