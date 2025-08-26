import PropTypes from 'prop-types';
import { Carousel, Col, Row, Container, Alert } from 'react-bootstrap';
import '../Style/style.scss';

const CustomCarousel = ({ images, title }) => {
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h4 className="mb-4 fw-bold">{title || 'Parceiros'}</h4>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col lg={10}>
          {images && images.length > 0 ? (
            <Carousel>
              {images.map((src, index) => (
                <Carousel.Item key={index}>
                  <img
                    className="d-block mx-auto"
                    src={src}
                    alt={`Imagem ${index + 1}`}
                    style={{
                      maxHeight: '300px',
                      objectFit: 'contain',
                    }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <Alert variant="warning" className="text-center">
              Nenhuma imagem disponível no momento
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

CustomCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string,
};

export default CustomCarousel;
