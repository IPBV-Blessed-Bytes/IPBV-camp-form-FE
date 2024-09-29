import React, { useState, useEffect } from 'react';
import './Skeleton.css'; // Arquivo CSS para os estilos do esqueleto

const Skeleton = () => {
  return (
    <div className="skeleton">
      <div className="skeleton-header"></div>
      <div className="skeleton-content">
        <div className="skeleton-block"></div>
        <div className="skeleton-block"></div>
        <div className="skeleton-block"></div>
      </div>
    </div>
  );
};



export default Skeleton;


const MyComponent = () => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
  
    useEffect(() => {
      // Simulando uma requisição de API com timeout
      setTimeout(() => {
        // Suponha que esta função traga dados do endpoint
        fetch('https://api.exemplo.com/data')
          .then((response) => response.json())
          .then((data) => {
            setData(data);
            setLoading(false);
          });
      }, 3000); // Espera de 3 segundos para simular o carregamento
    }, []);
  
    return (
      <div className="app">
        {loading ? (
          <Skeleton />
        ) : (
          <div className="content">
            <h1>Dados Carregados</h1>
            <p>{JSON.stringify(data)}</p>
          </div>
        )}
      </div>
    );
  };