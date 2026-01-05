import PropTypes from 'prop-types';
import { Container, Row, Col } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../Style/style.scss';
import fetcher from '@/fetchers/fetcherWithCredentials';

const CustomCarousel = ({ title }) => {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const { data } = await fetcher.get('/partners');
        setImages(data);
      } catch (error) {
        console.error('Erro ao buscar parceiros');
      }
    };

    fetchPartners();
  }, []);

  if (!images || images.length === 0) return null;

  return (
    <Container className="mt-5 mb-3 mb-md-0">
      <Row className="justify-content-center">
        <Col lg={10}>
          <h4 className="d-flex mb-4 fw-bold justify-content-center">{title || 'Título'}</h4>
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col lg={10}>
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
            {images.map((image, index) => (
              <SwiperSlide key={image.id || index}>
                <img src={image.url} alt={image.name || `Parceiro ${index + 1}`} />
              </SwiperSlide>
            ))}
          </Swiper>
        </Col>
      </Row>
    </Container>
  );
};

CustomCarousel.propTypes = {
  title: PropTypes.string,
  images: PropTypes.arrayOf(PropTypes.string),
};

export default CustomCarousel;
