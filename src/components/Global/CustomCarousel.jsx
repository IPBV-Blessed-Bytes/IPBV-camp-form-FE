import PropTypes from 'prop-types';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../Style/style.scss';

const CustomCarousel = ({ title, images }) => {
  return (
    <Container className="mt-5 mb-3 mb-md-0">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h4 className="d-flex mb-4 fw-bold justify-content-center">{title || 'Título'}</h4>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col lg={10}>
          {images && images.length > 0 ? (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={20}
              slidesPerView={5}
              loop={true}
              autoplay={{
                delay: 0,
                disableOnInteraction: false,
              }}
              speed={4000}
              grabCursor={true}
              allowTouchMove={true}
              breakpoints={{
                320: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                576: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                992: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
              }}
            >
              {images.map((src, index) => (
                <SwiperSlide key={index}>
                  <img src={src} alt={`Imagem ${index + 1}`} />
                </SwiperSlide>
              ))}
            </Swiper>
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
  title: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default CustomCarousel;
