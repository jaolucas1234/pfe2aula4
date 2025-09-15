import { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

function Modal({ receita, onClose, onSave, isEditing, isCreate }) {
  if (!receita) return null;

  const [formData, setFormData] = useState({
    nome: receita?.nome || '',
    tipo: receita?.tipo || '',
    ingredientes: receita?.ingredientes || '',
    modoFazer: receita?.modoFazer || '',
    img: receita?.img || '',
    custoAproximado: receita?.custoAproximado || 0
  });

  // Atualiza o estado do formulário quando a receita muda
  useEffect(() => {
    setFormData({
      nome: receita?.nome || '',
      tipo: receita?.tipo || '',
      ingredientes: receita?.ingredientes || '',
      modoFazer: receita?.modoFazer || '',
      img: receita?.img || '',
      custoAproximado: receita?.custoAproximado || 0
    });
  }, [receita]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (onSave) {
      const updatedData = {
        ...formData,
        ingredientes: formData.ingredientes.trim(),
        custoAproximado: parseFloat(formData.custoAproximado)
      };

      if (isCreate) {
        onSave(updatedData); // Criar receita
      } else if (isEditing) {
        onSave(receita.id, updatedData); // Editar receita
      }
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>
          {isCreate
            ? 'Criar Nova Receita'
            : isEditing
            ? `Editar ${receita.nome}`
            : `Ver ${receita.nome}`}
        </h2>

        <div>
          <label>Nome</label>
          <input
            type="text"
            name="nome"
            value={formData.nome}
            onChange={handleChange}
            disabled={!isCreate && !isEditing}
          />
        </div>

        <div>
          <label>Tipo</label>
          <select
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            disabled={!isCreate && !isEditing}
          >
            <option value="">Selecione um tipo</option>
            <option value="BEBIDA">BEBIDA</option>
            <option value="SALGADA">SALGADA</option>
            <option value="DOCE">DOCE</option>
          </select>
        </div>

        <div>
          <label>Ingredientes</label>
          <textarea
            name="ingredientes"
            value={formData.ingredientes}
            onChange={handleChange}
            disabled={!isCreate && !isEditing}
          />
        </div>

        <div>
          <label>Modo de Preparo</label>
          <textarea
            name="modoFazer"
            value={formData.modoFazer}
            onChange={handleChange}
            disabled={!isCreate && !isEditing}
          />
        </div>

        <div>
          <label>Imagem (URL)</label>
          <input
            type="text"
            name="img"
            value={formData.img}
            onChange={handleChange}
            disabled={!isCreate && !isEditing}
          />
        </div>

        <div>
          <label>Custo Aproximado</label>
          <input
            type="number"
            name="custoAproximado"
            value={formData.custoAproximado}
            onChange={handleChange}
            disabled={!isCreate && !isEditing}
          />
        </div>

        {(isEditing || isCreate) && (
          <button onClick={handleSave}>
            {isCreate ? 'Cadastrar' : 'Salvar'}
          </button>
        )}
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}

function deleteReceita(id) {
  axios
    .delete(`https://receitasapi-b-2025.vercel.app/receitas/${id}`)
    .then((response) => {
      console.log('Receita deletada:', response.data);
    })
    .catch((error) => {
      console.error('Erro ao deletar a receita:', error);
    });
}

function updateReceita(id, data) {
  console.log('Dados para atualizar:', data);
  axios
    .patch(`https://receitasapi-b-2025.vercel.app/receitas/${id}`, data)
    .then((response) => {
      console.log('Receita atualizada:', response.data);
    })
    .catch((error) => {
      console.error('Erro ao atualizar a receita:', error);
    });
}

function App() {
  const [receitas, setReceitas] = useState([]);
  const [modalReceita, setModalReceita] = useState(null);
  const [editReceitaData, setEditReceitaData] = useState(null);
  const [createReceitaData, setCreateReceitaData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axios.get(
        'https://receitasapi-b-2025.vercel.app/receitas'
      );
      setReceitas(response.data);
    };
    fetchData();
  }, []);

  const handleEditReceita = (id, updatedData) => {
    updateReceita(id, updatedData);
    setReceitas((prevReceitas) =>
      prevReceitas.map((receita) =>
        receita.id === id ? { ...receita, ...updatedData } : receita
      )
    );
  };

  const handleCreateReceita = (newData) => {
    axios
      .post('https://receitasapi-b-2025.vercel.app/receitas', newData)
      .then((response) => {
        setReceitas((prevReceitas) => [...prevReceitas, response.data]);
        console.log('Receita criada:', response.data);
      })
      .catch((error) => {
        console.error('Erro ao criar a receita:', error);
      });
  };

  return (
    <>
      <header>
        <h1>Receitas</h1>
        <button
          onClick={() =>
            setCreateReceitaData({
              nome: '',
              tipo: '',
              ingredientes: '',
              modoFazer: '',
              img: '',
              custoAproximado: 0
            })
          }
        >
          Cadastrar Receita
        </button>
      </header>

      <main className="card-container">
        {receitas.map((receita) => (
          <div className="card" key={receita.id}>
            <h2>{receita.nome}</h2>
            <h3>Ilustração:</h3>
            <img src={receita.img} alt={receita.nome} />
            <button onClick={() => setModalReceita(receita)}>Ver Receita</button>
            <button onClick={() => deleteReceita(receita.id)}>Deletar Receita</button>
            <button onClick={() => setEditReceitaData(receita)}>Editar Receita</button>
          </div>
        ))}
      </main>

      <footer>
        <p>Receitas do Fessor &copy; 2025</p>
      </footer>

      <Modal
        receita={modalReceita}
        onClose={() => setModalReceita(null)}
        isEditing={false}
      />

      <Modal
        receita={editReceitaData}
        onClose={() => setEditReceitaData(null)}
        onSave={handleEditReceita}
        isEditing={true}
      />

      <Modal
        receita={createReceitaData}
        onClose={() => setCreateReceitaData(null)}
        onSave={handleCreateReceita}
        isCreate={true}
      />
    </>
  );
}

export default App;
