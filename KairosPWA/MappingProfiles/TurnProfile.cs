using AutoMapper;
using KairosPWA.DTOs;
using KairosPWA.Models;

namespace KairosPWA.MappingProfiles
{
    public class TurnProfile : Profile
    {
        public TurnProfile()
        {
            CreateMap<Turn, TurnDTO>()
                .ForMember(dest => dest.ClientName, opt => opt.MapFrom(src => src.Client.Name))
                .ForMember(dest => dest.ServiceName, opt => opt.MapFrom(src => src.Service.Name));
            CreateMap<TurnDTO, Turn>()
                .ForMember(dest => dest.Client, opt => opt.Ignore())
                .ForMember(dest => dest.Service, opt => opt.Ignore());
            CreateMap<TurnCreateDTO, Turn>()
                .ForMember(dest => dest.Client, opt => opt.Ignore())
                .ForMember(dest => dest.Service, opt => opt.Ignore());
        }
    }
}
